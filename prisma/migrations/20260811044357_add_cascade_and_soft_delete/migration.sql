-- DropForeignKey
ALTER TABLE "project_media" DROP CONSTRAINT "project_media_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_tag" DROP CONSTRAINT "project_tag_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_tag" DROP CONSTRAINT "project_tag_tag_id_fkey";

-- AlterTable
ALTER TABLE "badge" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "stats" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "project_tag" ADD CONSTRAINT "project_tag_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tag" ADD CONSTRAINT "project_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
