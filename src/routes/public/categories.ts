import {Router} from "express";
import {prisma} from "../../lib/prisma.ts"

const router = Router();

router.get('/', async (req, res) => {
    try{
        const categories = await prisma.category.findMany(
            {
                where: {isActive: true},
                select: {
                    id: true,
                    title: true,
                }
            }
        );
        res.status(200).json({status: true, data: categories});
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Internal Server Error!"});
    }
})

export default router;
