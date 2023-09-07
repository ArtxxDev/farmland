-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "region" TEXT NOT NULL,
    "oblast" TEXT NOT NULL,
    "cadastral" TEXT NOT NULL,
    "composition" TEXT,
    "area" DOUBLE PRECISION,
    "ngo" DOUBLE PRECISION,
    "owner" TEXT,
    "contract" INTEGER,
    "contract_date" TIMESTAMP(3),
    "extract" INTEGER,
    "extract_date" TIMESTAMP(3),
    "document" TEXT,
    "expenses" DOUBLE PRECISION,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
