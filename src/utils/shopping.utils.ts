export const consolidateIngredients = (ingredients: any[]) => {
    const map: any = {};

    for (const item of ingredients) {
        const key = item.name.toLowerCase() + '|' + item.unit.toLowerCase();
        if (map[key]) {
            map[key].quantity += Number(item.quantity) || 0;
        } else {
            map[key] = { ...item, quantity: Number(item.quantity) || 0 };
        }
    }

    return Object.values(map);
};

export const excludePantryItems = (ingredients: any[], pantryItems: any[]) => {
    return ingredients.map(ing => {
        const pantryMatch = pantryItems.find(p => p.name.toLowerCase() === ing.name.toLowerCase() && p.unit === ing.unit);
        if (pantryMatch && pantryMatch.quantity > 0) {
            const needed = ing.quantity - Number(pantryMatch.quantity);
            return needed > 0 ? { ...ing, quantity: needed } : null;
        }
        return ing;
    }).filter(Boolean);
};

export const groupByCategory = (items: any[]) => {
    return items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});
};

export const evaluateSavings = (avgSpent: number, currentSpent: number) => {
    const savings = avgSpent - currentSpent;
    const savingsPercentage = avgSpent > 0 ? (savings / avgSpent) * 100 : 0;
    return { savings, savingsPercentage };
};

export const getExpirationAlert = (expirationDate: Date | string) => {
    const today = new Date();
    const exp = new Date(expirationDate);
    const diffTime = exp.getTime() - today.getTime();
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration <= 0) return 'Vencido';
    if (daysUntilExpiration <= 3) return `Próximo a vencer (${daysUntilExpiration} días)`;
    if (daysUntilExpiration <= 7) return `Vencimiento próximo`;
    return 'Ok';
};
