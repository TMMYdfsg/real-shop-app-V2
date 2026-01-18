-- CreateTable
CREATE TABLE "GameSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "taxRate" DOUBLE PRECISION NOT NULL,
    "insuranceRate" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "salaryAutoSafeRate" DOUBLE PRECISION NOT NULL,
    "turnDuration" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL DEFAULT 1,
    "isDay" BOOLEAN NOT NULL DEFAULT true,
    "isTimerRunning" BOOLEAN NOT NULL DEFAULT true,
    "lastTick" BIGINT NOT NULL,
    "timeRemaining" INTEGER NOT NULL,
    "marketStatus" TEXT NOT NULL DEFAULT 'open',
    "season" TEXT NOT NULL DEFAULT 'spring',
    "eventRevision" INTEGER NOT NULL DEFAULT 0,
    "economyStatus" TEXT NOT NULL DEFAULT 'normal',
    "economyInterestRate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "priceIndex" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "marketTrend" TEXT NOT NULL DEFAULT 'stable',
    "taxRateAdjust" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdateTurn" INTEGER NOT NULL DEFAULT 0,
    "envWeather" TEXT NOT NULL DEFAULT 'sunny',
    "envTemperature" INTEGER NOT NULL DEFAULT 20,
    "envSeason" TEXT NOT NULL DEFAULT 'spring',
    "infraPower" INTEGER NOT NULL DEFAULT 100,
    "infraWater" INTEGER NOT NULL DEFAULT 100,
    "infraNetwork" INTEGER NOT NULL DEFAULT 100,
    "securityLevel" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "debt" DOUBLE PRECISION NOT NULL,
    "popularity" INTEGER NOT NULL,
    "happiness" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "job" TEXT NOT NULL,
    "jobType" TEXT,
    "lastJobChangeTurn" INTEGER,
    "unpaidTax" DOUBLE PRECISION,
    "arrestCount" INTEGER,
    "stolenAmount" DOUBLE PRECISION,
    "fanCount" INTEGER,
    "employmentStatus" TEXT NOT NULL,
    "jobTitle" TEXT,
    "currentJobId" TEXT,
    "shopName" TEXT,
    "cardType" TEXT,
    "isInsured" BOOLEAN,
    "propertyLevel" TEXT,
    "health" INTEGER,
    "landRank" INTEGER,
    "commuteMethod" TEXT,
    "hasLicense" BOOLEAN,
    "homeLocationId" TEXT,
    "workLocationId" TEXT,
    "commuteDistance" DOUBLE PRECISION,
    "lastCommuteTurn" INTEGER,
    "carFuel" DOUBLE PRECISION,
    "isLate" BOOLEAN,
    "monthlyParkingCost" DOUBLE PRECISION,
    "region" TEXT,
    "creditScore" INTEGER,
    "isHospitalized" BOOLEAN,
    "suspicionScore" INTEGER,
    "playerIcon" TEXT,
    "stocks" JSONB,
    "forbiddenStocks" JSONB,
    "isForbiddenUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "inventory" JSONB,
    "shopItems" JSONB,
    "shopMenu" JSONB,
    "pointCards" JSONB,
    "catalogPoints" INTEGER,
    "loyaltyPoints" INTEGER,
    "ingredients" JSONB,
    "collection" JSONB,
    "furniture" JSONB,
    "pets" JSONB,
    "coupons" JSONB,
    "gachaCollection" JSONB,
    "shopWebsite" JSONB,
    "pointExchangeItems" JSONB,
    "ownedLands" JSONB,
    "ownedPlaces" JSONB,
    "mainPlaceId" TEXT,
    "sidePlaceIds" JSONB,
    "ownedVehicles" JSONB,
    "qualifications" JSONB,
    "examHistory" JSONB,
    "loans" JSONB,
    "insurances" JSONB,
    "lifeStats" JSONB,
    "family" JSONB,
    "partners" JSONB,
    "smartphone" JSONB,
    "commuteInfo" JSONB,
    "auditLogs" JSONB,
    "jobHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "previousPrice" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "isForbidden" BOOLEAN NOT NULL,
    "priceHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT,
    "description" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isSold" BOOLEAN NOT NULL,
    "description" TEXT,
    "condition" TEXT,
    "comment" TEXT,
    "imageUrl" TEXT,
    "createdAt" BIGINT,
    "soldAt" BIGINT,
    "buyerId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Land" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "ownerId" TEXT,
    "type" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "zoning" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Land_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "landId" TEXT NOT NULL,
    "stats" JSONB,
    "employees" JSONB,
    "licenses" JSONB,
    "insurances" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPC" (
    "id" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entryTime" BIGINT NOT NULL,
    "leaveTime" BIGINT NOT NULL,
    "effectApplied" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NPC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPCTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "spawnRate" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "minPayment" INTEGER,
    "maxPayment" INTEGER,
    "minStealItems" INTEGER,
    "maxStealItems" INTEGER,
    "minStealAmount" INTEGER,
    "maxStealAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NPCTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    "effectValue" DOUBLE PRECISION NOT NULL,
    "targetUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "ownerId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouletteResult" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "text" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "targetUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouletteResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "wholesalePrice" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Request_requesterId_idx" ON "Request"("requesterId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Transaction_receiverId_idx" ON "Transaction"("receiverId");

-- CreateIndex
CREATE INDEX "Transaction_senderId_idx" ON "Transaction"("senderId");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_isSold_idx" ON "Product"("isSold");

-- CreateIndex
CREATE INDEX "Land_ownerId_idx" ON "Land"("ownerId");

-- CreateIndex
CREATE INDEX "Place_ownerId_idx" ON "Place"("ownerId");

-- CreateIndex
CREATE INDEX "NPC_targetUserId_idx" ON "NPC"("targetUserId");

-- CreateIndex
CREATE INDEX "GameEvent_targetUserId_idx" ON "GameEvent"("targetUserId");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_createdAt_idx" ON "IdempotencyKey"("createdAt");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
