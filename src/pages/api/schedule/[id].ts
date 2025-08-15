import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Bad id" });

  if (req.method === "GET") {
    const row = await prisma.scheduleSlot.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ row });
  }
  if (req.method === "PUT") {
    const { title, days, timeRange } = req.body || {};
    const row = await prisma.scheduleSlot.update({ where: { id }, data: { title, days, timeRange } });
    return res.status(200).json({ row });
  }
  if (req.method === "DELETE") {
    await prisma.scheduleSlot.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).end();
}

export const config = { api: { bodyParser: true } };


