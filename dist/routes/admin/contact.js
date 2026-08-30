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
// GET all contacjs
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contacjs = yield prisma.contact.findMany({
            orderBy: { id: 'desc' }
        });
        res.status(200).json({ status: true, data: contacjs });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
}));
// GET contact by id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const contact = yield prisma.contact.findUnique({
            where: { id }
        });
        if (!contact) {
            return res.status(404).json({ status: false, error: "Contact not found!" });
        }
        res.status(200).json({ status: true, data: contact });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
}));
// DELETE contact
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const existing = yield prisma.contact.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({ status: false, error: "Contact not found!" });
        }
        yield prisma.contact.delete({
            where: { id }
        });
        res.status(200).json({ status: true, message: "Contact deleted successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
}));
export default router;
