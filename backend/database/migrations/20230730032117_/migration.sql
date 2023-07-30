/*
  Warnings:

  - A unique constraint covering the columns `[type,dateFrom,dateTo]` on the table `Point` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Point_type_dateFrom_dateTo_key" ON "Point"("type", "dateFrom", "dateTo");
