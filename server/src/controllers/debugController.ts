import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const inspectToken = (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'No Bearer token provided in Authorization header' });
  }

  const token = auth.split(' ')[1];
  try {
    // Try to decode without verifying first to show raw payload (if decodable)
    const decoded = jwt.decode(token, { complete: true });
    // Then try verify to show if verification succeeds
    let verified = null;
    try {
      const secret = process.env.JWT_SECRET || '';
      if (!secret) {
        verified = { _warning: 'JWT_SECRET not set on server; cannot verify signature' };
      } else {
        verified = jwt.verify(token, secret);
      }
    } catch (verErr: any) {
      verified = { error: verErr.message };
    }

    return res.json({ decoded, verified });
  } catch (err: any) {
    return res.status(422).json({ message: 'Token could not be decoded', error: err.message });
  }
};