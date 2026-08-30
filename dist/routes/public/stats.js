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
import { prisma } from "../../lib/prisma.js";
const router = Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield prisma.stats.findMany({
            select: {
                id: true,
                isActive: true,
                percentage: true,
                category: { select: { title: true } }
            }
        });
        res.status(200).json({ status: true, data: stats });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
}));
export default router;
