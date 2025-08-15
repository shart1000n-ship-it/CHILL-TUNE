import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { PrismaClient, LiveSource } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  const userId = (token?.sub as string) || "";
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "POST") {
    const { action, source } = (req.body || {}) as { action?: string; source?: keyof typeof LiveSource };
    if (!action || !source) return res.status(400).json({ error: "Missing action or source" });

    if (action === "start") {
      const row = await prisma.airtimeLog.create({ data: { userId, source: source as LiveSource } });
      return res.status(200).json({ ok: true, id: row.id });
    }
    if (action === "stop") {
      const { logId } = (req.body || {}) as { logId?: string };
      if (!logId) return res.status(400).json({ error: "Missing logId" });
      const endedAt = new Date();
      const existing = await prisma.airtimeLog.findUnique({ where: { id: logId } });
      if (!existing) return res.status(404).json({ error: "Not found" });
      const durationSec = Math.max(0, Math.floor((endedAt.getTime() - existing.startedAt.getTime()) / 1000));
      await prisma.airtimeLog.update({ where: { id: logId }, data: { endedAt, durationSec } });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: "Invalid action" });
  }

  if (req.method === "GET") {
    const { limit = 50 } = req.query;
    const rows = await prisma.airtimeLog.findMany({ orderBy: { startedAt: "desc" }, take: Number(limit) });
    return res.status(200).json({ rows });
  }

  return res.status(405).end();
}

export const config = { api: { bodyParser: true } };


