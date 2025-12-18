import Order from '../models/Order';
import { sendTrackingUpdateEmail } from './mailer';

// Mock courier status progression for demo purposes
const statusSequence = ['Label Created', 'In Transit', 'Out for Delivery', 'Delivered'];

const delayMs = (mins: number) => mins * 60 * 1000;

export const startTrackingPoller = (intervalMinutes = 5) => {
  console.log('Starting tracking poller (mock) — interval', intervalMinutes, 'minutes');

  const tick = async () => {
    try {
      // Find orders that have a tracking number and are not delivered/cancelled
      const orders = await Order.find({ trackingNumber: { $ne: '' }, trackingStatus: { $nin: ['Delivered', 'Cancelled'] } });
      for (const order of orders) {
        try {
          // If no history, create initial entry
          const lastEntry = (order.trackingHistory && order.trackingHistory.length > 0) ? order.trackingHistory[order.trackingHistory.length - 1] : null;
          let nextStatus = 'In Transit';

          if (!lastEntry) {
            nextStatus = 'In Transit';
          } else {
            const idx = statusSequence.indexOf(lastEntry.status as string);
            if (idx >= 0 && idx < statusSequence.length - 1) nextStatus = statusSequence[idx + 1];
            else nextStatus = lastEntry.status as string;
          }

          // For demo: only advance if last update was > intervalMinutes ago
          const shouldAdvance = !lastEntry || (Date.now() - new Date(lastEntry.timestamp).getTime() > delayMs(intervalMinutes));
          if (!shouldAdvance) continue;

          const entry = { status: nextStatus, location: '', message: 'Automated status update (demo)', timestamp: new Date() };
          order.trackingStatus = nextStatus as any;
          order.trackingHistory = order.trackingHistory ? [...order.trackingHistory, entry] : [entry];
          if (entry.status === 'Delivered') {
            order.orderStatus = 'Delivered';
          } else {
            order.orderStatus = 'Shipped';
          }
          if (['In Transit', 'Out for Delivery', 'Delivered'].includes(entry.status)) {
            order.shippedAt = order.shippedAt || new Date();
          }
          await order.save();

          // send email if user exists and email configured
          try {
            const User = (await import('../models/User')).default;
            const userDoc = await User.findById(order.user);
            if (userDoc) {
              if (userDoc.email) sendTrackingUpdateEmail(userDoc.email, order._id.toString(), entry).catch(e => console.error('Email failed', e));
              if ((userDoc as any).phone) {
                const { sendTrackingSms } = await import('./sms');
                sendTrackingSms((userDoc as any).phone, order._id.toString(), entry).catch(e => console.error('SMS failed', e));
              }
            }
          } catch (e) {
            console.error('Mailer dispatch error', e);
          }

          console.log('Polled tracking for order', order._id, 'set status', nextStatus);
        } catch (err) {
          console.error('Error processing order in poller:', err);
        }
      }
    } catch (err) {
      console.error('Error in tracking poller tick:', err);
    }
  };

  // Run immediately then at interval
  tick().catch(e => console.error(e));
  setInterval(() => tick().catch(e => console.error(e)), intervalMinutes * 60 * 1000);
};
