import {Router} from "express";
import {prisma} from "../../lib/prisma.js"

const router = Router();

router.get('/', async (req, res) => {
    try{
        const project = await prisma.project.findMany(
            {
                select: {
                    category: {},
                    imagePath: true,
                    title: true,
                    description: true,
                    tags: {select: {tag: true}}
                }
            }
        );
        res.status(200).json({status: true, data: project});
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Internal Server Error!"});
    }
})

export default router;
