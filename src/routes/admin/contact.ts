import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

// GET all contacjs
router.get('/', async (req, res) => {
    try {
        const contacjs = await prisma.contact.findMany({
            orderBy: { id: 'desc' }
        });
        res.status(200).json({ status: true, data: contacjs });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
});

// GET contact by id
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const contact = await prisma.contact.findUnique({
            where: { id }
        });
        
        if (!contact) {
            return res.status(404).json({ status: false, error: "Contact not found!" });
        }
        
        res.status(200).json({ status: true, data: contact });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        
        const existing = await prisma.contact.findUnique({
            where: { id }
        });
        
        if (!existing) {
            return res.status(404).json({ status: false, error: "Contact not found!" });
        }
        
        await prisma.contact.delete({
            where: { id }
        });
        
        res.status(200).json({ status: true, message: "Contact deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
});

export default router;
