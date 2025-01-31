-- CreateTable
CREATE TABLE "sessoes" (
    "sessionId" UUID NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "modifiedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "nome" VARCHAR(80) NOT NULL,
    "email" VARCHAR(80) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "senha" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "permissao" INTEGER DEFAULT 0,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "modified_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("cpf")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_publicKey_key" ON "sessoes"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_privateKey_key" ON "sessoes"("privateKey");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_privateKey_key" ON "usuarios"("privateKey");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_publicKey_key" ON "usuarios"("publicKey");
