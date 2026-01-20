-- AlterTable
ALTER TABLE "GameSettings" ADD COLUMN     "moneyMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "Land" ADD COLUMN     "allowCompany" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowConstruction" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isForSale" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maintenanceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "polygon" JSONB,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cryptoHoldings" JSONB;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "Crypto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "previousPrice" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "priceHistory" JSONB,
    "creatorId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crypto_pkey" PRIMARY KEY ("id")
);
