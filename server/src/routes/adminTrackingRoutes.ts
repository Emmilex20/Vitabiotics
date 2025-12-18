import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { generateRandomTracking, generateTrackingForCarrier, SUPPORTED_CARRIERS } from '../utils/trackingGenerator';
import Order from '../models/Order';
import User from '../models/User';
import { sendTrackingUpdateEmail } from '../utils/mailer';
import { sendTrackingSms } from '../utils/sms';

const router = Router();

/**
 * POST /api/admin/orders/:id/auto-assign-tracking
 * Admin endpoint to auto-generate and assign a tracking number to an order
 * Optional: ?carrier=FedEx to specify carrier, otherwise random
 */
router.post('/:id/auto-assign-tracking', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { carrier } = req.query;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate tracking details
    const tracking = carrier && typeof carrier === 'string'
      ? generateTrackingForCarrier(carrier as any)
      : generateRandomTracking();

    // Update order with tracking information
    order.trackingNumber = tracking.trackingNumber;
    order.carrier = tracking.carrier;
    order.trackingUrl = tracking.trackingUrl;
    order.trackingStatus = 'Label Created';
    order.orderStatus = 'Processing';

    // Add initial tracking entry to history
    const initialEntry = {
      status: 'Label Created',
      message: `Tracking label generated for ${tracking.carrier}`,
      location: 'Processing facility',
      timestamp: new Date(),
    };
    // Ensure trackingHistory array exists
    if (!order.trackingHistory) order.trackingHistory = [];
    order.trackingHistory.push(initialEntry);
    await order.save();

    // Get customer info and send notification (order.user references the User _id)
    const user = await User.findById(order.user?.toString());
    if (user) {
      if (user.email) {
        sendTrackingUpdateEmail(user.email, order._id.toString(), initialEntry)
          .catch(e => console.error('Email notification failed', e));
      }
      // phone is optional on User model; check existence
      if ((user as any).phone) {
        sendTrackingSms((user as any).phone, order._id.toString(), initialEntry)
          .catch(e => console.error('SMS notification failed', e));
      }
    }

    res.json({
      message: 'Tracking assigned successfully',
      order: {
        _id: order._id,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        trackingUrl: order.trackingUrl,
        trackingStatus: order.trackingStatus,
      },
    });
  } catch (err: any) {
    console.error('Auto-assign tracking error', err);
    res.status(500).json({ message: 'Failed to auto-assign tracking', error: err.message });
  }
});

/**
 * GET /api/admin/orders/tracking/carriers
 * Return list of supported carriers for dropdown
 */
router.get('/tracking/carriers', protect, admin, (req, res) => {
  res.json({ carriers: SUPPORTED_CARRIERS });
});

/**
 * POST /api/admin/orders/bulk-assign-tracking
 * Bulk assign random tracking to multiple orders
 * Body: { orderIds: ['id1', 'id2', ...], carrier?: 'FedEx' }
 */
router.post('/bulk-assign-tracking', protect, admin, async (req, res) => {
  try {
    const { orderIds, carrier } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'orderIds must be a non-empty array' });
    }

    const results = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          results.push({ orderId, success: false, message: 'Order not found' });
          continue;
        }

        // Generate tracking details
        const tracking = carrier
          ? generateTrackingForCarrier(carrier)
          : generateRandomTracking();

        // Update order
        order.trackingNumber = tracking.trackingNumber;
        order.carrier = tracking.carrier;
        order.trackingUrl = tracking.trackingUrl;
        order.trackingStatus = 'Label Created';
        order.orderStatus = 'Processing';

        const entry = {
          status: 'Label Created',
          message: `Tracking label generated for ${tracking.carrier}`,
          location: 'Processing facility',
          timestamp: new Date(),
        };
        if (!order.trackingHistory) order.trackingHistory = [];
        order.trackingHistory.push(entry);
        await order.save();

        // Notify customer
        const user = await User.findById(order.user?.toString());
        if (user?.email) {
          sendTrackingUpdateEmail(user.email, order._id.toString(), entry)
            .catch(e => console.error('Email failed for', orderId, e));
        }
        if ((user as any)?.phone) {
          sendTrackingSms((user as any).phone, order._id.toString(), entry).catch(e => console.error('SMS failed for', orderId, e));
        }

        results.push({
          orderId,
          success: true,
          tracking: {
            number: tracking.trackingNumber,
            carrier: tracking.carrier,
          },
        });
      } catch (err: any) {
        results.push({ orderId, success: false, message: err.message });
      }
    }

    res.json({
      message: 'Bulk tracking assignment complete',
      results,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Bulk assignment failed', error: err.message });
  }
});

export default router;
