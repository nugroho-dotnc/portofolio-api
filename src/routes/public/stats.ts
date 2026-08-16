import {Router} from "express";
import {prisma} from "../../lib/prisma.ts"

const router = Router();

router.get('/', async (req, res) => {
    try{
        const stats = await prisma.stats.findMany(
            {
                select: {
                  isActive: true,
                  percentage: true,
                  category: {select: {title: true}} 
                }
            }
        );
        res.status(200).json({status: true, data: stats});
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Internal Server Error!"});
    }
})

export default router;
