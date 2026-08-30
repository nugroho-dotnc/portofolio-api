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
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { prisma } from "../../lib/prisma.js";
import z from "zod";
const router = Router();
router.use(requireAdmin);
const projecjschemas = z.object({
    title: z.string(),
    shortDescription: z.string().optional(),
    description: z.string(),
    imagePath: z.string(),
    link: z.string().optional(),
    githubUrl: z.string().optional(),
    isActive: z.boolean(),
    categoryId: z.number().int(),
    tags: z.array(z.number().int()).optional(),
    media: z.array(z.string()).optional(),
});
// READ
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projecjs = yield prisma.project.findMany({ include: { category: true, media: true, tags: true } });
        return res.status(200).json({ status: true, data: projecjs });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            error: "internal server error"
        });
    }
}));
// READ DETAIL
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield prisma.project.findUnique({
            where: { id: Number(req.params.id) },
            include: { category: true, media: true, tags: { include: { tag: true } } }
        });
        if (!project) {
            return res.status(404).json({ status: false, error: `Project dengan id ${Number(req.params.id)} tidak ditemukan!` });
        }
        return res.status(200).json({ status: true, data: project });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            error: "internal server error"
        });
    }
}));
// CREATE
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = projecjschemas.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const { title, isActive, categoryId, shortDescription, description, imagePath, link, githubUrl, tags, media } = parsed.data;
        if (tags && tags.length > 0) {
            const existingTags = yield prisma.tag.findMany({
                where: { id: { in: tags } },
                select: { id: true }
            });
            if (existingTags.length !== tags.length) {
                const existingsIds = existingTags.map((t) => t.id);
                const invalidIds = tags.filter((id) => !existingsIds.includes(id));
                return res.status(400).json({
                    status: false,
                    error: `Tag id tidak valid: ${invalidIds.join(", ")}`
                });
            }
        }
        const project = yield prisma.project.create({
            data: {
                title, isActive, categoryId, shortDescription, description, imagePath, link, githubUrl,
                tags: tags ? { create: tags.map((tagId) => ({ tagId })) } : undefined,
                media: media ? { create: media.map((imageUrl) => ({ imageUrl })) } : undefined
            }
        });
        return res.status(201).json({ status: true, data: project });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            error: "internal server error"
        });
    }
}));
// UPDATE
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = projecjschemas.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, error: parsed.error.flatten() });
        }
        const exist = yield prisma.project.findUnique({ where: { id: Number(req.params.id) } });
        if (!exist) {
            return res.status(404).json({ status: false, error: `Project dengan id ${Number(req.params.id)} tidak ditemukan!` });
        }
        const { title, categoryId, shortDescription, description, imagePath, link, githubUrl, isActive, tags, media } = parsed.data;
        if (tags && tags.length > 0) {
            const existingTags = yield prisma.tag.findMany({
                where: { id: { in: tags } },
                select: { id: true }
            });
            if (existingTags.length !== tags.length) {
                const existingsIds = existingTags.map((t) => t.id);
                const invalidIds = tags.filter((id) => !existingsIds.includes(id));
                return res.status(400).json({
                    status: false,
                    error: `Tag id tidak valid: ${invalidIds.join(", ")}`
                });
            }
        }
        const projectId = Number(req.params.id);
        const project = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const updated = yield tx.project.update({
                where: { id: projectId },
                data: {
                    title, categoryId, shortDescription, description, imagePath, link, githubUrl, isActive
                }
            });
            if (tags !== undefined) {
                yield tx.projectTag.deleteMany({ where: { projectId } });
                if (tags.length > 0) {
                    yield tx.projectTag.createMany({
                        data: tags.map((tagId) => ({ projectId, tagId }))
                    });
                }
            }
            if (media !== undefined) {
                yield tx.projectMedia.deleteMany({ where: { projectId } });
                if (media.length > 0) {
                    yield tx.projectMedia.createMany({
                        data: media.map((imageUrl) => ({ projectId, imageUrl }))
                    });
                }
            }
            return tx.project.findUnique({
                where: { id: projectId },
                include: { category: true, media: true, tags: { include: { tag: true } } }
            });
        }));
        return res.status(200).json({ status: true, data: project });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            error: "internal server error"
        });
    }
}));
// DELETE
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = yield prisma.project.delete({ where: { id: Number(req.params.id) } });
        return res.status(200).json({ status: true, data: project });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            error: "internal server error"
        });
    }
}));
export default router;
