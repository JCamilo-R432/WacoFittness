export const getRecommendations = (userProfile: any) => {
    const recommendations: any[] = [];

    if (userProfile.goal === 'muscleGain') {
        recommendations.push({ supplement: 'protein', priority: 1, evidence: 'A' }, { supplement: 'creatine', priority: 1, evidence: 'A' });
    } else if (userProfile.goal === 'fatLoss') {
        recommendations.push({ supplement: 'protein', priority: 1, evidence: 'A' }, { supplement: 'caffeine', priority: 2, evidence: 'A' });
    }

    if (userProfile.trainingIntensity === 'high') {
        recommendations.push({ supplement: 'electrolytes', priority: 2, evidence: 'B' });
    }

    if (userProfile.diet === 'vegan') {
        recommendations.push({ supplement: 'B12', priority: 1, evidence: 'A' });
        recommendations.push({ supplement: 'iron', priority: 2, evidence: 'B' });
    }

    if (userProfile.age && userProfile.age > 40) {
        recommendations.push({ supplement: 'omega3', priority: 2, evidence: 'A' });
        recommendations.push({ supplement: 'vitaminD', priority: 2, evidence: 'A' });
    }

    if (userProfile.budget && userProfile.budget < 50) {
        return recommendations.filter(r => r.priority === 1); // Return only essentials
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
};

export const calculateDaysRemaining = (userSupplement: any) => {
    const totalServings = Number(userSupplement.quantity) / Number(userSupplement.dailyDosage);
    const daysRemaining = Math.floor(totalServings);

    return {
        daysRemaining,
        isLowStock: daysRemaining <= 7
    };
};

export const checkExpiration = (expirationDate: Date | string) => {
    const diffTime = new Date(expirationDate).getTime() - new Date().getTime();
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration <= 0) return { isExpired: true, msg: 'Vencido' };
    if (daysUntilExpiration <= 30) return { isExpired: false, msg: `Próximo a vencer (${daysUntilExpiration} días)` };
    return { isExpired: false, msg: 'Ok' };
};

export const calculateMonthlyCost = (userSupplements: any[]) => {
    let totalCost = 0;
    for (const supplement of userSupplements) {
        if (supplement.purchasePrice && supplement.quantity && supplement.dailyDosage) {
            const costPerUnit = Number(supplement.purchasePrice) / Number(supplement.quantity);
            const monthlyCost = costPerUnit * Number(supplement.dailyDosage) * 30;
            totalCost += monthlyCost;
        }
    }
    return totalCost;
};

export const checkInteractions = (supplements: any[]) => {
    // basic mock logic
    const interactions = [];
    const names = supplements.map((s: any) => s.name?.toLowerCase() || s.supplement?.name?.toLowerCase() || '');

    const hasPreWorkout = names.some((n: string) => n.includes('pre-workout'));
    const hasCaffeine = names.some((n: string) => n.includes('caffeine'));

    if (hasPreWorkout && hasCaffeine) {
        interactions.push('Precaución: Alto consumo de cafeína simultáneo.');
    }

    return interactions;
};
