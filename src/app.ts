import "dotenv/config"; 
import express, { type Express, type Request, type Response } from 'express';
import authRoutes from "../src/routes/auth.ts"
import categorieRoutes from "../src/routes/admin/categories.ts"
import uploadRoutes from "../src/routes/admin/upload.ts"
import badgeRoutes from "../src/routes/admin/badge.ts"
import projectRoutes from "../src/routes/admin/project.ts"
import tagRoutes from "../src/routes/admin/tag.ts"
import issuerRoutes from "../src/routes/admin/issuer.ts"
import statsRoutes from "../src/routes/admin/stats.ts"
import adminContactRoutes from "../src/routes/admin/contact.ts"

import publicBadgeRoutes from "../src/routes/public/badge.ts"
import publicCategoriesRoutes from "../src/routes/public/categories.ts"
import publicExpertiseRoutes from "../src/routes/public/expertise.ts"
import publicLandingRoutes from "../src/routes/public/landing.ts"
import publicProjectRoutes from "../src/routes/public/project.ts"
import publicStatsRoutes from "../src/routes/public/stats.ts"
// import publicTagRoutes from "../src/routes/public/tag.ts"
import publicContactRoutes from "../src/routes/public/contact.ts"

import cors from "cors";
const app: Express = express();
const PORT = 3000;
app.use(cors({
  origin: process.env.FRONTEND_URL, // ex: "http://localhost:5173"
}));

app.use(express.json()); 

// ADMIN ENDPOINT
app.use('/api/auth', authRoutes)
app.use('/api/admin/categories', categorieRoutes)
app.use('/api/admin/upload', uploadRoutes)
app.use('/api/admin/badge',  badgeRoutes)
app.use('/api/admin/project',  projectRoutes)
app.use('/api/admin/tag', tagRoutes)
app.use('/api/admin/issuer', issuerRoutes)
app.use('/api/admin/stats', statsRoutes)
app.use('/api/admin/contact', adminContactRoutes)

// PUBLIC ENDPOINT
app.use('/api/public/badge', publicBadgeRoutes)
app.use('/api/public/categories', publicCategoriesRoutes)
app.use('/api/public/expertise', publicExpertiseRoutes)
app.use('/api/public/landing', publicLandingRoutes)
app.use('/api/public/project', publicProjectRoutes)
app.use('/api/public/stats', publicStatsRoutes)
// app.use('/api/public/tag', publicTagRoutes)
app.use('/api/public/contact', publicContactRoutes)

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});