import { Router } from "express";
import z from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.ts";
import { prisma } from "../../lib/prisma.ts";

const router = Router();
router.use(requireAdmin)

const categorieSchemas = z.object(
    {
        icon: z.string(),
        title: z.string(),
        description: z.string(),
        is_expertise: z.boolean(),
        is_active: z.boolean()
    }
);

// POST
router.post('/', async (req, res) => {
    try{
        const parsed = categorieSchemas.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({status: false, error: parsed.error.flatten()})
        }

        const {icon, title, description, is_expertise, is_active} = parsed.data;
        
        const exist = await prisma.category.findFirst({where: {title}});

        if(exist){
            return res.status(409).json({status: false, error: `Kategori dengan nama ${title} sudah ada`})
        }

        const category = await prisma.category.create({
            data: {
                title, icon, description, isExpertise: is_expertise, isActive: is_active
            }
        });

        res.status(201).json({status: true, data: category})
    }catch(e){
        console.error(e);
        return res.status(500).json({status: false, error: "Terjadi kesalahan server"});
    }
});

// READ
router.get('/', async (req, res)=> {
    try{
        const category = await prisma.category.findMany({where: {isActive: true}})
        return res.status(200).json({status: true, data: category})
    }catch(e){
        console.error(e);
        return res.status(500).json({status: false, error: "Terjadi kesalahan server"});
    }
});

// PUT
router.put('/:id', async (req, res)=> {
    try{
        const parsed = categorieSchemas.partial().safeParse(req.body)
        if(!parsed.success){
            return res.status(400).json({status: false, error: parsed.error.flatten()});
        }

        if(parsed.data.title){
            const exist = await prisma.category.findFirst({where: {title: parsed.data.title, id: {not: Number(req.params.id)}}})
            if(exist){
                return res.status(409).json({status: false, error: `Kategori dengan nama ${parsed.data.title} sudah ada`})
            }
        }
        const {icon, title, description, is_expertise, is_active} = parsed.data;

        const category = await prisma.category.update({
            where: {id: Number(req.params.id)},
            data: {
                title, icon, description, isExpertise: is_expertise, isActive: is_active
            }
        })
        res.status(200).json({status: true, data: category})

    }catch(e){
        console.error(e);
        return res.status(500).json({status: false, error: "Terjadi kesalahan server"});
    }
});

// DELETE
router.delete('/:id', async (req, res)=> {
    try{
        const existing = prisma.category.findUnique({where:{id: Number(req.params.id)}})
        if(!existing){
            return res.status(404).json({status: false, error: "Data tidak ditemukan"})
        }
        const category = await prisma.category.update({where: {id: Number(req.params.id)}, data: {isActive: false}})
        return res.status(200).json({status: true, data: category})
    }catch(e){
        console.error(e);
        return res.status(500).json({status: false, error: "Terjadi kesalahan server"});
    }
});

export default router;