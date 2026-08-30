var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/routes/admin/upload.ts
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { supabaseAdmin } from "../../lib/supabase.js";
const router = Router();
router.use(requireAdmin);
// simpan file sementara di memory, bukan disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("File harus berupa gambar"));
        }
        cb(null, true);
    },
});
router.post("/", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ status: false, error: "File tidak ditemukan" });
        }
        const folder = req.query.folder || "misc"; // ex: badge, project, issuer
        const fileExt = req.file.originalname.split(".").pop();
        const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;
        const { error } = yield supabaseAdmin.storage
            .from("images")
            .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
        });
        if (error)
            throw error;
        const { data } = supabaseAdmin.storage.from("images").getPublicUrl(fileName);
        res.status(201).json({ status: true, data: { url: data.publicUrl } });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: "Gagal upload gambar" });
    }
}));
export default router;
