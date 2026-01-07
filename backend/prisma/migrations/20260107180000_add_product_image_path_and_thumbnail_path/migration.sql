-- AlterTable
ALTER TABLE "Product" RENAME COLUMN "imageUrl" TO "imagePath";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "thumbnailPath" TEXT;


