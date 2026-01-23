-- AlterTable
ALTER TABLE "GameSettings" ADD COLUMN     "economyTotalSales" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "isGameStarted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDebugAuthorized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needsTraitSelection" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skills" JSONB,
ADD COLUMN     "timeEra" TEXT,
ADD COLUMN     "traits" JSONB,
ADD COLUMN     "vacationReason" TEXT;
