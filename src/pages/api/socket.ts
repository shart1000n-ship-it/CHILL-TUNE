// Deprecated duplicate; use pages/api/socket-io.ts instead.
import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ error: "Use /api/socket-io" });
}

export const config = { api: { bodyParser: false } };


