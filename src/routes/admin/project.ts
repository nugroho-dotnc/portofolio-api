import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import {prisma} from "../../lib/prisma.js";
import z from "zod";

const router = Router();
router.use(requireAdmin);

const projecjschemas = z.object({
    title: z.string(),
    short_description: z.string().optional(),
    description: z.string(),
    imagePath: z.string(),
    is_active: z.boolean(),
    category_id: z.number().int(),
    tags: z.array(z.number().int()).optional(),
    media: z.array(z.string()).optional(),
});

// READ
router.get('/', async (req, res) => {
    try{
        const projecjs = await prisma.project.findMany({where: {isActive: true}, include: {category: true, media: true, tags: true}});
        return res.status(200).json({status: true, data: projecjs});
    }catch(err){
        console.error(err);
        return res.status(500).json({
            status:false,
            error: "internal server error"
        })
    }
})

// READ DETAIL
router.get('/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.id) },
            include: { category: true, media: true, tags: { include: { tag: true } } }
        });

        if (!project) {
            return res.status(404).json({ status: false, error: `Project dengan id ${Number(req.params.id)} tidak ditemukan!` });
        }

        return res.status(200).json({ status: true, data: project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            error: "internal server error"
        });
    }
})

// CREATE
router.post('/', async (req, res) => {
    try{
        const parsed = projecjschemas.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({status: false, error: parsed.error.flatten()});
        }

        const {title, is_active, category_id, short_description, description, imagePath, tags, media} = parsed.data
        
        if(tags && tags.length > 0){
            const existingTags = await prisma.tag.findMany({
                where: {id: {in: tags}},
                select: {id: true}
            });

            if(existingTags.length !== tags.length){
                const existingsIds = existingTags.map((t) => t.id);
                const invalidIds = tags.filter((id) => !existingsIds.includes(id));

                return res.status(400).json({
                    status: false, 
                    error: `Tag id tidak valid: ${invalidIds.join(", ")}`
                })
            }

        }

        const project = await prisma.project.create({
            data: {
                title, isActive: is_active, categoryId: category_id, shortDescription: short_description, description, imagePath,
                tags: tags ? {create: tags.map((tagId)=> ({tagId}))} : undefined,
                media: media ? {create: media.map((imageUrl)=> ({imageUrl}))} : undefined
            }
        });

        return res.status(201).json({status: true, data: project});
    }catch(err){
        console.error(err);
        return res.status(500).json({
            status:false,
            error: "internal server error"
        });
    }
})

// UPDATE
router.put('/:id', async (req, res) => {
    try{
        const parsed = projecjschemas.partial().safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({status: false, error: parsed.error.flatten()});
        }
        const exist = await prisma.project.findUnique({where: {id: Number(req.params.id)}});

        if(!exist){
            return res.status(404).json({status: false, error: `Project dengan id ${Number(req.params.id)} tidak ditemukan!`})
        }

        const {title, category_id, short_description, description, imagePath, is_active, tags, media} = parsed.data;

        if(tags && tags.length > 0){
            const existingTags = await prisma.tag.findMany({
                where: {id: {in: tags}},
                select: {id: true}
            });

            if(existingTags.length !== tags.length){
                const existingsIds = existingTags.map((t) => t.id);
                const invalidIds = tags.filter((id) => !existingsIds.includes(id));

                return res.status(400).json({
                    status: false, 
                    error: `Tag id tidak valid: ${invalidIds.join(", ")}`
                })
            }

        }
        const projectId = Number(req.params.id)

        const project = await prisma.$transaction(async (tx)=> {
            const updated = await tx.project.update(
                {
                    where: {id: projectId},
                    data: {
                        title, categoryId: category_id, shortDescription: short_description, description, imagePath, isActive: is_active
                    }
                }
            );

            if(tags !== undefined){
                await tx.projectTag.deleteMany({where: {projectId}});
                if(tags.length > 0){
                    await tx.projectTag.createMany({
                        data: tags.map((tagId)=> ({projectId, tagId}))
                    })
                }
            }

            if(media !== undefined){
                await tx.projectMedia.deleteMany({where: {projectId}});
                if(media.length > 0){
                    await tx.projectMedia.createMany({
                        data: media.map((imageUrl)=> ({projectId, imageUrl}))
                    })
                }
            }
            
            return tx.project.findUnique({
                where: {id: projectId},
                include: {category: true, media: true, tags: {include: {tag: true}}}
            })
        });

        return res.status(200).json({status: true, data: project});
    }catch(err){
        console.error(err);
        return res.status(500).json({
            status:false,
            error: "internal server error"
        });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try{
        const project = await prisma.project.delete({where: {id: Number(req.params.id)}})
        return res.status(200).json({status: true, data: project})
    }catch(err){
        console.error(err);
        return res.status(500).json({
            status:false,
            error: "internal server error"
        });
    }
});

export default router;