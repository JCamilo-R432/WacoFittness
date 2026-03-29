import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List
export const createShoppingList = async (userId: string, data: any) => {
    return await prisma.shoppingList.create({
        data: { userId, ...data }
    });
};

export const getShoppingLists = async (userId: string, status?: string) => {
    return await prisma.shoppingList.findMany({
        where: {
            userId,
            ...(status && { status })
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
    });
};

export const getShoppingListById = async (id: string, userId: string) => {
    return await prisma.shoppingList.findFirst({
        where: { id, userId },
        include: { items: true, sharedWith: true }
    });
};

// Items
export const addListItem = async (shoppingListId: string, data: any) => {
    const count = await prisma.shoppingListItem.count({ where: { shoppingListId } });
    return await prisma.shoppingListItem.create({
        data: { shoppingListId, position: count, ...data }
    });
};

export const toggleItemPurchase = async (itemId: string, purchased: boolean) => {
    return await prisma.shoppingListItem.update({
        where: { id: itemId },
        data: { isPurchased: purchased, purchasedAt: purchased ? new Date() : null }
    });
};

// Pantry
export const getPantryItems = async (userId: string) => {
    return await prisma.pantryItem.findMany({
        where: { userId },
        orderBy: { expirationDate: 'asc' }
    });
};

export const createPantryItem = async (userId: string, data: any) => {
    return await prisma.pantryItem.create({
        data: { userId, ...data }
    });
};

export const consumePantryItem = async (id: string, amountToConsume: number) => {
    // Reduces quantity or marks deleted
    const item = await prisma.pantryItem.findUnique({ where: { id } });
    if (!item) return null;
    const newQuantity = Number(item.quantity) - amountToConsume;
    if (newQuantity <= 0) {
        return await prisma.pantryItem.delete({ where: { id } });
    } else {
        return await prisma.pantryItem.update({
            where: { id },
            data: { quantity: newQuantity }
        });
    }
};

// History
export const createPurchaseHistory = async (userId: string, shoppingList: any) => {
    const amount = shoppingList.items.reduce((sum: number, it: any) => sum + (Number(it.realPrice || it.estimatedPrice || 0) * Number(it.quantity)), 0);

    return await prisma.purchaseHistory.create({
        data: {
            userId,
            shoppingListId: shoppingList.id,
            purchaseDate: new Date(),
            totalAmount: amount,
            itemsCount: shoppingList.items.length
        }
    });
};
