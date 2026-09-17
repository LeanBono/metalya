import { prisma } from '@/lib/prisma';
const materials=[
 ['Hierro y acero','Ferrosos',180,240],['Cobre','No ferrosos',9000,10500],['Aluminio','No ferrosos',2200,3000],['Bronce','No ferrosos',6000,7200],['Acero inoxidable','No ferrosos',2500,3400],['Motores eléctricos','Electromecánico',700,1200],['Cable de cobre','No ferrosos',6000,7800],['Chapa','Ferrosos',180,260]
] as const;
export async function seedMaterials(){ for(const [name,category,buyPrice,sellPrice] of materials){ await prisma.material.upsert({where:{name},update:{category,buyPrice,sellPrice},create:{name,category,buyPrice,sellPrice}}); } }
