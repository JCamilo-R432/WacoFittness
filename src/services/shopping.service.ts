import prisma from '../config/database';

export class ShoppingService {
  static async createList(userId: string, data: any) {
    return await prisma.shoppingList.create({
      data: {
        ...data,
        userId,
        status: 'pending'
      }
    });
  }

  static async getLists(userId: string) {
    return await prisma.shoppingList.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getListById(id: string, userId: string) {
    const list = await prisma.shoppingList.findUnique({
      where: { id },
      include: { items: { orderBy: { position: 'asc' } } }
    });
    if (!list || list.userId !== userId) throw new Error('Lista no encontrada');
    return list;
  }

  static async addItem(listId: string, userId: string, data: any) {
    const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) throw new Error('No autorizado');

    return await prisma.shoppingListItem.create({
      data: {
        ...data,
        shoppingListId: listId
      }
    });
  }

  static async updateItem(itemId: string, userId: string, data: any) {
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { shoppingList: true }
    });

    if (!item || item.shoppingList.userId !== userId) throw new Error('No autorizado');

    return await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        ...data,
        purchasedAt: data.isPurchased ? new Date() : null
      }
    });
  }

  static async getStores() {
    return await prisma.store.findMany({
      where: { isFavorite: true },
      take: 20
    });
  }
}
