import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { createSupabaseAdmin } from "@/lib/supabase";

export const config = { api: { bodyParser: false } };

const prisma = new PrismaClient();

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ multiples: false, maxFiles: 1 });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  const userId = (token?.sub as string) || "";
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).end();

  try {
    const { fields, files } = await parseForm(req);
    const title = String(fields.title || "Podcast Episode");
    const durationSec = fields.durationSec ? Number(fields.durationSec) : undefined;
    const f = files.file as File | File[] | undefined;
    const file = Array.isArray(f) ? f[0] : f;
    if (!file || !file.filepath) return res.status(400).json({ error: "Missing file" });

    // Prefer Supabase storage if configured
    let publicUrl: string | null = null;
    const supabase = createSupabaseAdmin();
    if (supabase) {
      const bucket = process.env.SUPABASE_BUCKET_PODCASTS || "podcasts";
      const ext = path.extname(file.originalFilename || ".webm") || ".webm";
      const safeName = (file.originalFilename || "episode").replace(/[^a-zA-Z0-9._-]+/g, "_");
      const objectKey = `${Date.now()}_${safeName}${ext.toLowerCase().startsWith(".") ? "" : ext}`;
      const fileBuf = fs.readFileSync(file.filepath);
      await supabase.storage.createBucket(bucket, { public: true }).catch(() => {});
      const upload = await supabase.storage.from(bucket).upload(objectKey, fileBuf, { upsert: true, contentType: file.mimetype || "audio/webm" });
      if (upload.error) throw upload.error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(objectKey);
      publicUrl = data.publicUrl;
      try { fs.unlinkSync(file.filepath); } catch {}
    }
    if (!publicUrl) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "podcasts");
      fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(file.originalFilename || ".webm") || ".webm";
      const safeName = (file.originalFilename || "episode").replace(/[^a-zA-Z0-9._-]+/g, "_");
      const outName = `${Date.now()}_${safeName}${ext.toLowerCase().startsWith(".") ? "" : ext}`;
      const outPath = path.join(uploadsDir, outName);
      fs.renameSync(file.filepath, outPath);
      publicUrl = `/uploads/podcasts/${outName}`;
    }

    const row = await prisma.podcastEpisode.create({
      data: { userId, title, fileUrl: publicUrl, durationSec: durationSec || null },
    });
    return res.status(200).json({ ok: true, episode: row });
  } catch (e) {
    return res.status(500).json({ error: "Upload failed" });
  }
}


