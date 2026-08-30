var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import z from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { prisma } from "../../lib/prisma.js";
const router = Router();
router.use(requireAdmin);
const tagSchemas = z.object({
    title: z.string(),
});
// POST
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = tagSchemas.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { title } = parsed.data;
        const exist = yield prisma.tag.findFirst({ where: { title } });
        if (exist) {
            return res.status(409).json({ status: false, error: `error dengan judul ${exist.title} sudah ada!` });
        }
        const tag = yield prisma.tag.create({
            data: {
                title: title
            }
        });
        res.status(201).json({
            status: true, data: tag
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "internal server error!" });
    }
}));
// UPDATE
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = tagSchemas.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { title } = parsed.data;
        const exist = yield prisma.tag.findFirst({ where: { title } });
        if (exist) {
            return res.status(409).json({ status: false, error: `error dengan judul ${exist.title} sudah ada!` });
        }
        const tags = yield prisma.tag.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title
            }
        });
        res.status(200).json({ status: true, data: tags });
    }
    catch (err) {
    }
}));
// READ
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tag = yield prisma.tag.findMany();
        return res.status(200).json({ status: true, data: tag });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Terjadi kesalahan server!" });
    }
}));
// DELETE
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield prisma.tag.findUnique({ where: { id: Number(req.params.id) } });
        if (existing) {
            const tag = yield prisma.tag.delete({ where: { id: Number(req.params.id) } });
            return res.status(200).json({ status: true, data: tag });
        }
        else {
            return res.status(404).json({ status: false, error: `data dengan id: ${Number(req.params.id)} tidak ditemukan!` });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Terjadi kesalahan server!" });
    }
}));
export default router;
