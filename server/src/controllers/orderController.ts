// /server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import Order, { IOrderItem } from '../models/Order';
import Product from '../models/Product';
import { protect } from '../middleware/authMiddleware'; 
import { IUser } from '../models/User';
import mongoose from 'mongoose';

// Extend the Request interface to include user from the protect middleware
interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Requires protection middleware)
export const addOrderItems = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  const { orderItems: rawOrderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

  if (!rawOrderItems || rawOrderItems.length === 0 || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required order details' });
  }
  
  // Using a Mongoose transaction ensures atomicity: 
  // Inventory is updated only if the order creation succeeds.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems: IOrderItem[] = rawOrderItems;
    
    // 1. Check product availability and prepare inventory update
    for (const item of orderItems) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error(`Product not found for ID: ${item.productId}`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
      }
    }

    // 2. Create the Order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      isPaid: false, // Assume payment processing happens *after* this step in a real app (e.g., Stripe call)
    });

    const createdOrder = await order.save({ session });

    // 3. Update Inventory (Decrement stock for each item)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } }, // Decrement stock
        { session }
      );
    }
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with the created order
    res.status(201).json(createdOrder);

  } catch (error: any) {
    // Abort transaction in case of any error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Order creation failed:', error);
    // 400 for business logic errors (like stock), 500 for server errors
    res.status(400).json({ message: error.message || 'Failed to create order due to a server error.' });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Find all orders for the authenticated user ID
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    // Return consistent object shape to match other endpoints
    res.json({ orders, total: orders.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Find all orders and populate user info
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Transform orderStatus to status for frontend compatibility
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      status: order.orderStatus.toLowerCase()
    }));
    
    res.json({ 
      orders: transformedOrders,
      total: orders.length,
      message: 'Successfully retrieved all orders'
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Capitalize status to match enum values
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(capitalizedStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: capitalizedStatus },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Transform response
    const response = {
      ...order.toObject(),
      status: order.orderStatus.toLowerCase()
    };

    res.json({
      message: 'Order status updated successfully',
      order: response
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

// @desc    Update order tracking info (Admin only)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateOrderTracking = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const { id } = req.params;
    const { trackingNumber, carrier, trackingUrl, status, message, location } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create tracking entry
    const entry = {
      status: status || (trackingUrl ? 'In Transit' : 'Label Created'),
      location: location || '',
      message: message || '',
      timestamp: new Date(),
    };

    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.carrier = carrier || order.carrier;
    order.trackingUrl = trackingUrl || order.trackingUrl;
    order.trackingStatus = entry.status;
    order.trackingHistory = order.trackingHistory ? [...order.trackingHistory, entry] : [entry];

    // Map simple statuses to order.orderStatus
    if (entry.status === 'Delivered') {
      order.orderStatus = 'Delivered';
    } else if (['In Transit', 'Out for Delivery', 'Label Created', 'Exception'].includes(entry.status)) {
      order.orderStatus = 'Shipped';
    }

    if (entry.status === 'In Transit' || entry.status === 'Out for Delivery' || entry.status === 'Delivered') {
      order.shippedAt = order.shippedAt || new Date();
    }

    const updated = await order.save();

    // Notify user via email (if configured) and SMS (if configured)
    try {
      const User = (await import('../models/User')).default;
      const { sendTrackingUpdateEmail } = await import('../utils/mailer');
      const { sendTrackingSms } = await import('../utils/sms');
      const userDoc = await User.findById(order.user);
      if (userDoc) {
        if (userDoc.email) {
          sendTrackingUpdateEmail(userDoc.email, order._id.toString(), entry).catch(e => console.error('Email send failed', e));
        }
        if ((userDoc as any).phone) {
          sendTrackingSms((userDoc as any).phone, order._id.toString(), entry).catch(e => console.error('SMS send failed', e));
        }
      }
    } catch (e) {
      console.error('Failed to send tracking notification:', e);
    }

    res.json({ message: 'Tracking updated', order: updated });
  } catch (error) {
    console.error('Error updating order tracking:', error);
    res.status(500).json({ message: 'Server error updating tracking' });
  }
};

// @desc    Get order by ID (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id).populate('user', 'firstName lastName email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow access if owner or admin
    const isOwner = order.user && (order.user as any)._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order by id:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// @desc    Public tracking lookup by tracking number
// @route   GET /api/tracking/:trackingNumber
// @access  Public
export const getTrackingByNumber = async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;
    if (!trackingNumber) return res.status(400).json({ message: 'Tracking number required' });

    const order = await Order.findOne({ trackingNumber: trackingNumber });
    if (!order) return res.status(404).json({ message: 'Tracking not found' });

    // Return limited public info
    const payload = {
      _id: order._id,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      trackingStatus: order.trackingStatus,
      trackingUrl: order.trackingUrl,
      trackingHistory: order.trackingHistory || [],
      lastUpdated: order.updatedAt,
    };

    res.json(payload);
  } catch (error) {
    console.error('Error fetching tracking by number:', error);
    res.status(500).json({ message: 'Server error fetching tracking' });
  }
};