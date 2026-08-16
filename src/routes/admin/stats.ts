import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.ts";
import { prisma } from "../../lib/prisma.ts";

const router = Router();
router.use(requireAdmin);

const statsSchema = z.object({
  categoryId: z.number().int(),
  percentage: z.number().min(0).max(100),
  isActive: z.boolean().optional(),
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const parsed = statsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }

    const { categoryId, percentage, isActive } = parsed.data;

    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    
    if (!category) {
      return res.status(404).json({ status: false, error: "Kategori tidak ditemukan" });
    }

    const stat = await prisma.stats.create({
      data: { categoryId, percentage, isActive: isActive ?? true },
    });

    res.status(201).json({ status: true, data: stat });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const stats = await prisma.stats.findMany({ include: { category: true } });
    res.status(200).json({ status: true, data: stats });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const parsed = statsSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }

    const stat = await prisma.stats.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });

    res.status(200).json({ status: true, data: stat });
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
    const existing = await prisma.stats.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
    }

    await prisma.stats.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ status: true, message: "Data berhasil dihapus" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

export default router;
