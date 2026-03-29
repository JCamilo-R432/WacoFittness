import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedNotificationTemplates() {
  console.log('🔔 Sembrando plantillas de notificaciones...')

  const templates = [
    {
      name: 'recordatorio_desayuno',
      category: 'nutrition',
      type: 'reminder',
      title: '¡Es hora del desayuno! 🌅',
      body: 'No olvides registrar tu desayuno para mantener el control de tus macros hoy.',
      priority: 'normal',
      channel: 'push',
      language: 'es',
      variables: ['nombre'],
      isPredefined: true,
      isActive: true
    },
    {
      name: 'logro_hidratacion',
      category: 'hydration',
      type: 'achievement',
      title: '¡Objetivo cumplido! 💧',
      body: 'Has alcanzado tu meta de hidratación diaria. ¡Excelente trabajo!',
      priority: 'high',
      channel: 'push',
      language: 'es',
      variables: ['nombre'],
      isPredefined: true,
      isActive: true
    }
  ]

  const categories = ['nutrition', 'training', 'hydration', 'recovery', 'supplements']
  for (let i = templates.length; i < 50; i++) {
    const cat = categories[i % categories.length]
    templates.push({
      name: `template_pro_${i + 1}`,
      category: cat,
      type: 'reminder',
      title: `Notificación de ${cat.toUpperCase()}`,
      body: 'Este es un mensaje profesional diseñado para motivar y guiar al usuario en su camino fitness.',
      priority: 'normal',
      channel: 'push',
      language: 'es',
      variables: ['nombre'],
      isPredefined: true,
      isActive: true
    } as any)
  }

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    })
  }

  console.log(`✅ ${templates.length} plantillas de notificación sembradas.`)
}
