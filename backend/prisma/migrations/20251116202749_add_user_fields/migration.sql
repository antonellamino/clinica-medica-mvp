-- AlterTable
ALTER TABLE "users" ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3),
ADD COLUMN     "obra_social" TEXT,
ADD COLUMN     "telefono" TEXT;
