import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.ts";
import { prisma } from "../../lib/prisma.ts";

const router = Router();
router.use(requireAdmin);

const badgeSchema = z.object({
  title: z.string(),
  description: z.string(),
  imagePath: z.string(),
  credentialUrl: z.string().optional(),
  categoryId: z.number().int(),
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const parsed = badgeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }

    const { title, description, imagePath, credentialUrl, categoryId } = parsed.data;

    const exist = await prisma.badge.findFirst({ where: { title } });
    if (exist) {
      return res.status(409).json({ status: false, error: `Badge dengan nama ${title} sudah ada` });
    }

    const badge = await prisma.badge.create({
      data: { title, description, imagePath, credentialUrl, categoryId },
    });

    res.status(201).json({ status: true, data: badge });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({ include: { category: true, issuer: true } });
    res.status(200).json({ status: true, data: badges });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const parsed = badgeSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }

    const badge = await prisma.badge.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });

    res.status(200).json({ status: true, data: badge });
  } catch (e: any) {
    if (e.code === "P2025") {
      return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
    }
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const existing = await prisma.badge.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
    }

    await prisma.badge.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ status: true, message: "Data berhasil dihapus" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

export default router;