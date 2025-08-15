import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rows = await prisma.scheduleSlot.findMany({ orderBy: { createdAt: "asc" } });
    return res.status(200).json({ rows });
  }
  if (req.method === "POST") {
    const { title, days, timeRange } = req.body || {};
    if (!title || !days || !timeRange) return res.status(400).json({ error: "Missing fields" });
    const row = await prisma.scheduleSlot.create({ data: { title, days, timeRange } });
    return res.status(200).json({ row });
  }
  return res.status(405).end();
}

export const config = { api: { bodyParser: true } };


