import type { NextApiRequest, NextApiResponse } from "next";

// Minimal stub: if an HLS playback URL is configured via env, return it.
// For full egress, configure LiveKit Egress and replace this with actual start calls.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { roomName } = req.body || {};
  if (!roomName) return res.status(400).json({ error: "Missing roomName" });

  const playbackUrl = process.env.NEXT_PUBLIC_LIVEKIT_HLS_URL;
  if (playbackUrl) {
    return res.status(200).json({ started: true, egressId: null, playbackUrl });
  }

  return res.status(400).json({
    error: "HLS not configured",
    hint:
      "Set NEXT_PUBLIC_LIVEKIT_HLS_URL to your LiveKit HLS playlist URL or implement LiveKit Egress start here.",
  });
}

export const config = { api: { bodyParser: true } };


