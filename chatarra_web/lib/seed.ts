import { prisma } from '@/lib/prisma';
import { co2FactorForName } from '@/lib/co2';

const materials = [
  ['Hierro y acero', 'Ferrosos', 180, 240, 0, 'CABA / GBA'],
  ['Cobre', 'No ferrosos', 9000, 10500, 0, 'CABA / GBA'],
  ['Aluminio', 'No ferrosos', 2200, 3000, 0, 'CABA / GBA'],
  ['Bronce', 'No ferrosos', 6000, 7200, 0, 'CABA / GBA'],
  ['Acero inoxidable', 'No ferrosos', 2500, 3400, 0, 'CABA / GBA'],
  ['Motores el\u00e9ctricos', 'Electromec\u00e1nico', 700, 1200, 0, 'CABA / GBA'],
  ['Cable de cobre', 'No ferrosos', 6000, 7800, 0, 'CABA / GBA'],
  ['Chapa', 'Ferrosos', 180, 260, 0, 'CABA / GBA'],
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
