import {Router} from "express";
import {prisma} from "../../lib/prisma.js"

const router = Router();

router.get('/', async (req, res) => {
    try{
        const project = await prisma.project.findMany(
            {
                where: { isActive: true },
                select: {
                    category: {},
                    id: true,
                    imagePath: true,
                    title: true,
                    description: true,
                    shortDescription: true,
                    tags: {select: {tag: true}},
                    media: true
                }
            }
        );
        res.status(200).json({status: true, data: project});
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Internal Server Error!"});
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const project = await prisma.project.findUnique({
            where: { id, isActive: true },
            include: {
                category: true,
                media: true,
                tags: { select: { tag: true } }
            }
        });
        if (!project) {
            return res.status(404).json({ status: false, error: "Project not found!" });
        }
        res.status(200).json({ status: true, data: project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
});

export default router;
