import type { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { roomName, identity, publish } = req.body || {};
  const apiKey = process.env.LIVEKIT_API_KEY as string;
  const apiSecret = process.env.LIVEKIT_API_SECRET as string;
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL as string;
  if (!apiKey || !apiSecret || !livekitUrl) return res.status(400).json({ error: 'LiveKit env not set' });
  if (!roomName || !identity) return res.status(400).json({ error: 'Missing roomName or identity' });

  const at = new AccessToken(apiKey, apiSecret, {
    identity: String(identity),
    ttl: '10m',
  });
  at.addGrant({
    room: String(roomName),
    roomJoin: true,
    canPublish: !!publish,
    canSubscribe: true,
  });
  const token = at.toJwt();
  return res.status(200).json({ token, url: livekitUrl });
}

export const config = { api: { bodyParser: true } };


