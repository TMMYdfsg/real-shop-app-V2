-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD', 'HIDDEN');

-- CreateTable
CREATE TABLE "parcels" (
    "id" TEXT NOT NULL,
    "addressNormalized" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "ParcelStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT,
    "ownerUserId" TEXT,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parcels_ownerUserId_key" ON "parcels"("ownerUserId");

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
