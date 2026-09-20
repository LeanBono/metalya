import { prisma } from '@/lib/prisma';
import { co2FactorForName } from '@/lib/co2';

const materials = [
  ['Hierro y acero', 'Ferrosos', 180, 240, 50, 'CABA / GBA'],
  ['Cobre', 'No ferrosos', 9000, 10500, 5, 'CABA / GBA'],
  ['Aluminio', 'No ferrosos', 2200, 3000, 20, 'CABA / GBA'],
  ['Bronce', 'No ferrosos', 6000, 7200, 10, 'CABA / GBA'],
  ['Acero inoxidable', 'No ferrosos', 2500, 3400, 20, 'CABA / GBA'],
  ['Motores eléctricos', 'Electromecánico', 700, 1200, 1, 'CABA / GBA'],
  ['Cable de cobre', 'No ferrosos', 6000, 7800, 10, 'CABA / GBA'],
  ['Chapa', 'Ferrosos', 180, 260, 50, 'CABA / GBA'],
] as const;

export async function seedMaterials() {
  for (const [name, category, buyPrice, sellPrice, minKg, zoneNote] of materials) {
    const co2FactorKg = co2FactorForName(name);
    await prisma.material.upsert({
      where: { name },
      update: { category, buyPrice, sellPrice, co2FactorKg, minKg, zoneNote, publicList: true },
      create: {
        name,
        category,
        buyPrice,
        sellPrice,
        co2FactorKg,
        minKg,
        zoneNote,
        publicList: true,
      },
    });
  }
}
