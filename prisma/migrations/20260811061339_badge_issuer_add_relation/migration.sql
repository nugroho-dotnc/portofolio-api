-- AlterTable
ALTER TABLE "badge" ADD COLUMN     "issuer_id" INTEGER;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "issuer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
