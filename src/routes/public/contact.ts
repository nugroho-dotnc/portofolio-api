import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ status: false, error: "All fields are required" });
        }

        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                subject,
                message
            }
        });

        res.status(201).json({ status: true, data: contact });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, error: "Internal Server Error!" });
    }
});

export default router;
