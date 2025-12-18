import { Router } from 'express';
import { protect, admin, AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import { sendAdminMessageEmail } from '../utils/mailer';

const router = Router();

// GET /api/admin/users - list all users (no passwordHash)
router.get('/', protect, admin, async (req: AuthRequest, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ users });
  } catch (err: any) {
    console.error('Failed to list users', err);
    res.status(500).json({ message: 'Failed to list users', error: err.message });
  }
});

// PUT /api/admin/users/:id - update user fields (admin only)
router.put('/:id', protect, admin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, phone, disabled } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) (user as any).phone = phone;
    if (disabled !== undefined) (user as any).disabled = !!disabled;

    await user.save();
    const safe = (await User.findById(id))?.toObject();
    if (safe) delete (safe as any).passwordHash;
    res.json({ message: 'User updated', user: safe });
  } catch (err: any) {
    console.error('Update user failed', err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// DELETE /api/admin/users/:id - soft-delete (mark disabled=true)
router.delete('/:id', protect, admin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    (user as any).disabled = true;
    await user.save();
    res.json({ message: 'User disabled (soft deleted)' });
  } catch (err: any) {
    console.error('Soft-delete (disable) user failed', err);
    res.status(500).json({ message: 'Failed to disable user', error: err.message });
  }
});

// POST /api/admin/users/:id/restore - restore previously disabled user
router.post('/:id/restore', protect, admin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    (user as any).disabled = false;
    await user.save();
    res.json({ message: 'User restored' });
  } catch (err: any) {
    console.error('Restore user failed', err);
    res.status(500).json({ message: 'Failed to restore user', error: err.message });
  }
});

// DELETE /api/admin/users/:id/permanent - Permanently delete a user (irreversible)
router.delete('/:id/permanent', protect, admin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User permanently deleted' });
  } catch (err: any) {
    console.error('Permanent delete failed', err);
    res.status(500).json({ message: 'Failed to permanently delete user', error: err.message });
  }
});

// POST /api/admin/users/:id/message - send an admin message to user (email, optional sms)
router.post('/:id/message', protect, admin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { subject, message, sendSms } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.email && !sendSms) {
      return res.status(400).json({ message: 'User has no email; enable sendSms or update phone.' });
    }

    // Send email
    if (user.email) {
      await sendAdminMessageEmail(user.email, subject || 'Message from Vitabiotics', message || '');
    }

    // Optionally send SMS if requested and phone exists
    // Reuse sendTrackingSms for simplicity (it just sends a body)
    if (sendSms && (user as any).phone) {
      const { sendTrackingSms } = await import('../utils/sms');
      await sendTrackingSms((user as any).phone, `admin-message`, { status: message || 'Message', message });
    }

    res.json({ message: 'Message sent' });
  } catch (err: any) {
    console.error('Failed to send admin message', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

export default router;
