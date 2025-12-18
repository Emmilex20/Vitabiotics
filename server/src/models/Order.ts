// /server/src/models/Order.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for the items stored within the Order document (embedded)
export interface IOrderItem {
  productId: Types.ObjectId; // Reference to the Product
  name: string; // Embedded name for stability
  price: number; // Embedded price at time of purchase
  quantity: number;
}

// Interface for the Order Document
export interface IOrder extends Document {
  user: Types.ObjectId; // Reference to the User
  orderItems: IOrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  isPaid: boolean;
  paidAt?: Date;
  shippedAt?: Date;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  trackingStatus?: 'Label Created' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception' | 'Cancelled';
  trackingHistory?: { status: string; location?: string; message?: string; timestamp: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderItems: [OrderItemSchema], // Array of embedded order items
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalAmount: { type: Number, required: true, default: 0.0 },
    orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    trackingNumber: { type: String, default: '' },
    carrier: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    trackingStatus: { type: String, enum: ['Label Created', 'In Transit', 'Out for Delivery', 'Delivered', 'Exception', 'Cancelled'], default: 'Label Created' },
    trackingHistory: [{ status: String, location: String, message: String, timestamp: Date }],
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;