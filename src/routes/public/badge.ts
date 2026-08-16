import {Router} from "express";
import {prisma} from "../../lib/prisma.ts"

const router = Router();

router.get('/', async (req, res) => {
    try{
        const badges = await prisma.badge.findMany(
            {
                where: {isActive: true},
                select: {
                    id: true,
                    title: true,
                    imagePath: true,
                    description: true,
                    credentialUrl: true,
                    issuer: {
                        select: {
                            imagePath: true,
                            name: true
                        }
                    }
                }
            }
        );
        res.status(200).json({status: true, data: badges});
    }catch(err){
        console.error(err);
        return res.status(500).json({status: false, error: "Internal Server Error!"});
    }
})

export default router;