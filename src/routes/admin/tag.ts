import { Router } from "express";
import z from "zod";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { prisma } from "../../lib/prisma.js"

const router = Router();

router.use(requireAdmin);

const tagSchemas = z.object({
    title: z.string(),
});

// POST
router.post('/', async (req, res) => {
    try{
        const parsed = tagSchemas.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({status: false, error: parsed.error.flatten()})
        }

        const {title} = parsed.data;

        const exist = await prisma.tag.findFirst({where: {title}});
        if(exist){
            return res.status(409).json({status: false, error: `error dengan judul ${exist.title} sudah ada!`})
        }

        const tag = await prisma.tag.create({
            data: {
                title: title
            }
        });
        
        res.status(201).json({
            status: true, data: tag
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "internal server error!"})
    }
});

// UPDATE
router.put("/:id", async (req, res)=> {
    try{
        const parsed = tagSchemas.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({status: false, error: parsed.error.flatten()})
        }

        const {title} = parsed.data;

        const exist = await prisma.tag.findFirst({where: {title}});

        if(exist){
            return res.status(409).json({status: false, error: `error dengan judul ${exist.title} sudah ada!`})
        }

        const tags = await prisma.tag.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title
            }
        });
        res.status(200).json({status: true, data: tags})
    }catch(err){

    }
});

// READ
router.get("/", async (req, res) => {
    try{
        const tag = await prisma.tag.findMany();
        return res.status(200).json({status: true, data: tag});
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Terjadi kesalahan server!"});
    }
});

// DELETE
router.delete('/:id', async (req, res)=> {
    try{
        const existing = await prisma.tag.findUnique({where:{id: Number(req.params.id)}});
        if(existing){
            const tag = await prisma.tag.delete({where:{id:Number(req.params.id)}});
            return res.status(200).json({status: true, data: tag});
        }else{
            return res.status(404).json({status: false, error: `data dengan id: ${Number(req.params.id)} tidak ditemukan!`})
        }
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Terjadi kesalahan server!"});
    }
});
export default router;