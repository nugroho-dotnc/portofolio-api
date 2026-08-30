import express from 'express';
import authRoutes from "./routes/auth.js";
import categorieRoutes from "./routes/admin/categories.js";
import uploadRoutes from "./routes/admin/upload.js";
import badgeRoutes from "./routes/admin/badge.js";
import projectRoutes from "./routes/admin/project.js";
import tagRoutes from "./routes/admin/tag.js";
import issuerRoutes from "./routes/admin/issuer.js";
import statsRoutes from "./routes/admin/stats.js";
import adminContactRoutes from "./routes/admin/contact.js";
import publicBadgeRoutes from "./routes/public/badge.js";
import publicCategoriesRoutes from "./routes/public/categories.js";
import publicExpertiseRoutes from "./routes/public/expertise.js";
import publicLandingRoutes from "./routes/public/landing.js";
import publicProjectRoutes from "./routes/public/project.js";
import publicStatsRoutes from "./routes/public/stats.js";
// import publicTagRoutes from "../src/routes/public/tag.js"
import publicContactRoutes from "./routes/public/contact.js";
import cors from "cors";
const app = express();
app.use(cors({
    origin: true,
}));
app.use(express.json());
// ADMIN ENDPOINT
app.use('/api/auth', authRoutes);
app.use('/api/admin/categories', categorieRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/badge', badgeRoutes);
app.use('/api/admin/project', projectRoutes);
app.use('/api/admin/tag', tagRoutes);
app.use('/api/admin/issuer', issuerRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/admin/contact', adminContactRoutes);
// PUBLIC ENDPOINT
app.use('/api/public/badge', publicBadgeRoutes);
app.use('/api/public/categories', publicCategoriesRoutes);
app.use('/api/public/expertise', publicExpertiseRoutes);
app.use('/api/public/landing', publicLandingRoutes);
app.use('/api/public/project', publicProjectRoutes);
app.use('/api/public/stats', publicStatsRoutes);
// app.use('/api/public/tag', publicTagRoutes)
app.use('/api/public/contact', publicContactRoutes);
export default app;
