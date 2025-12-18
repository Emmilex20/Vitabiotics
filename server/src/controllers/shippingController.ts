import { Request, Response } from 'express';
import Order from '../models/Order';
import mongoose from 'mongoose';
import { createTracker, getTracker, verifyWebhook } from '../services/easypostService';

// Admin creates/links a tracker for a given order
export const createShipmentTracker = async (req: Request, res: Response) => {
  try {
    const { orderId, trackingNumber, carrier } = req.body;
    if (!orderId || !trackingNumber) return res.status(400).json({ message: 'orderId and trackingNumber required' });
    if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ message: 'Invalid order id' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Create tracker in EasyPost (if configured)
    let tracker = null;
    try {
      tracker = await createTracker(trackingNumber, carrier);
    } catch (e: any) {
      console.warn('EasyPost tracker create failed (continuing):', e?.message || e);
    }

    // store tracking info on order
    order.trackingNumber = trackingNumber;
    order.carrier = carrier || order.carrier;
    order.trackingUrl = (tracker && tracker.tracking_url) ? tracker.tracking_url : order.trackingUrl;
    order.trackingStatus = tracker ? (tracker.status || order.trackingStatus) : order.trackingStatus;
    order.trackingHistory = order.trackingHistory || [];
    if (tracker) {
      order.trackingHistory.push({ status: tracker.status || 'Label Created', location: '', message: 'Tracker created via EasyPost', timestamp: new Date() });
    } else {
      order.trackingHistory.push({ status: 'Label Created', location: '', message: 'Tracker created (no carrier API)', timestamp: new Date() });
    }

    await order.save();
    res.json({ message: 'Tracker linked', order, tracker });
  } catch (error: any) {
    console.error('Error creating shipment tracker:', error);
    res.status(500).json({ message: 'Server error creating tracker' });
  }
};

// EasyPost webhook receiver
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // For express.raw middleware, the raw body is available in req.body as a Buffer
    const rawBody = req.body as Buffer | string;
    const sig = (req.headers['x-hook-signature'] as string) || (req.headers['x-easypost-signature'] as string) || '';
    if (!verifyWebhook(rawBody, sig)) {
      console.warn('Invalid webhook signature');
      return res.status(400).send('Invalid webhook signature');
    }

    // Parse event from raw body if necessary
    const event = typeof req.body === 'string' ? JSON.parse(req.body as string) : (req.body as any);
    const result = event.result || event;

    // Try to find order by tracking code
    const trackingCode = result.tracking_code || (result.tracking_codes && result.tracking_codes[0]) || result.tracking_number;
    if (!trackingCode) {
      console.warn('Webhook missing tracking code');
      return res.status(200).send('ok');
    }

    const order = await Order.findOne({ trackingNumber: trackingCode });
    if (!order) {
      console.warn('Webhook: no order found for tracking code', trackingCode);
      return res.status(200).send('ok');
    }

    const status = result.status || result.tracking_status || 'In Transit';
    const message = result.message || JSON.stringify(result);

    const entry = { status, location: result.tracking_details ? (result.tracking_details[0]?.checkpoint_location || '') : '', message, timestamp: new Date() };
    order.trackingHistory = order.trackingHistory ? [...order.trackingHistory, entry] : [entry];
    order.trackingStatus = status;
    if (status === 'delivered' || /deliv/i.test(status)) {
      order.orderStatus = 'Delivered';
      order.shippedAt = order.shippedAt || new Date();
    } else {
      order.orderStatus = 'Shipped';
    }

    await order.save();

    // Optionally notify user (email/SMS) — reuse controller logic
    try {
      const User = (await import('../models/User')).default;
      const { sendTrackingUpdateEmail } = await import('../utils/mailer');
      const { sendTrackingSms } = await import('../utils/sms');
      const userDoc = await User.findById(order.user);
      if (userDoc) {
        if (userDoc.email) sendTrackingUpdateEmail(userDoc.email, order._id.toString(), entry).catch(e => console.error('Email send failed', e));
        if ((userDoc as any).phone) sendTrackingSms((userDoc as any).phone, order._id.toString(), entry).catch(e => console.error('SMS send failed', e));
      }
    } catch (e) {
      console.error('Failed to send notifications for webhook:', e);
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error('Error handling shipping webhook:', error);
    res.status(500).send('error');
  }
};
