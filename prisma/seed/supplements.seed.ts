import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedSupplements() {
  console.log('💊 Sembrando suplementos profesionales...')

  const supplements = [
    {
      name: 'Whey Protein Isolate (WPI)',
      category: 'protein',
      subcategory: 'whey',
      activeIngredients: [{ name: 'Proteína de suero aislada', amount: 25000, unit: 'mg' }],
      servingSize: '1 scoop (30g)',
      servingsPerContainer: 30,
      recommendedDosage: '1-2 scoops diarios según requerimiento proteico',
      timing: ['postWorkout', 'morning'],
      benefits: ['Recuperación muscular rápida', 'Alta biodisponibilidad'],
      evidenceLevel: 'A',
      averagePrice: 55.00,
      isVerified: true
    },
    {
      name: 'Creatina Monohidratada (Creapure)',
      category: 'creatine',
      subcategory: 'monohydrate',
      activeIngredients: [{ name: 'Creatina Monohidratada', amount: 5000, unit: 'mg' }],
      servingSize: '5g',
      servingsPerContainer: 60,
      recommendedDosage: '3-5g diarios consistentes',
      timing: ['anytime', 'postWorkout'],
      benefits: ['Aumento de fuerza explosiva', 'Voluminización celular'],
      evidenceLevel: 'A',
      averagePrice: 30.00,
      isVerified: true
    },
    {
      name: 'Beta-Alanina',
      category: 'aminoAcids',
      activeIngredients: [{ name: 'Beta-Alanina', amount: 3200, unit: 'mg' }],
      servingSize: '3.2g',
      servingsPerContainer: 50,
      recommendedDosage: '3-5g diarios (puede causar parestesia)',
      timing: ['preWorkout'],
      benefits: ['Retraso de la fatiga muscular', 'Buffer de ácido láctico'],
      evidenceLevel: 'A',
      averagePrice: 25.00,
      isVerified: true
    }
  ]

  const categories = ['protein', 'creatine', 'preWorkout', 'vitamins', 'aminoAcids', 'omega']
  for (let i = supplements.length; i < 150; i++) {
    const cat = categories[i % categories.length]
    supplements.push({
      name: `Suplemento Premium ${i + 1} (${cat})`,
      category: cat,
      activeIngredients: [{ name: 'Ingrediente Activo', amount: 500, unit: 'mg' }],
      servingSize: '1 unidad',
      servingsPerContainer: 30,
      recommendedDosage: 'Consultar con especialista',
      timing: ['morning'],
      benefits: ['Mejora del rendimiento general'],
      evidenceLevel: 'B',
      averagePrice: Math.floor(Math.random() * 50) + 20,
      isVerified: true
    } as any)
  }

  for (let i = 0; i < supplements.length; i += 50) {
    const batch = supplements.slice(i, i + 50)
    await prisma.supplement.createMany({
      data: batch,
      skipDuplicates: true
    })
  }

  console.log(`✅ ${supplements.length} suplementos sembrados exitosamente.`)
}
