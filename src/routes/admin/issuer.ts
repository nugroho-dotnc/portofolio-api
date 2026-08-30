import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { prisma } from "../../lib/prisma.js";

const router = Router();
router.use(requireAdmin);

const issuerSchema = z.object({
  name: z.string(),
  imagePath: z.string(),
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const parsed = issuerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }

    const { name, imagePath } = parsed.data;

    const exist = await prisma.issuer.findFirst({ where: { name } });
    if (exist) {
      return res.status(409).json({ status: false, error: `Issuer dengan nama ${name} sudah ada` });
    }

    const issuer = await prisma.issuer.create({
      data: { name, imagePath },
    });

    res.status(201).json({ status: true, data: issuer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const issuers = await prisma.issuer.findMany();
    res.status(200).json({ status: true, data: issuers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const parsed = issuerSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: false, error: parsed.error.flatten() });
    }

    const issuer = await prisma.issuer.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });

    res.status(200).json({ status: true, data: issuer });
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
    const existing = await prisma.issuer.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) {
      return res.status(404).json({ status: false, error: "Data tidak ditemukan" });
    }

    await prisma.issuer.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ status: true, message: "Data berhasil dihapus" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: "Terjadi kesalahan server" });
  }
});

export default router;
