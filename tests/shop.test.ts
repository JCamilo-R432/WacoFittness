/**
 * Tests for Shop / Supplement Store logic
 * Pure function tests — no DB or external services required
 */

// ── Product filtering helpers (mirrors shop.service.ts logic) ─────────────

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  inStock: boolean;
  tags: string[];
}

function filterProducts(
  products: Product[],
  opts: { category?: string; minRating?: number; inStockOnly?: boolean; search?: string }
): Product[] {
  return products.filter(p => {
    if (opts.category && p.category !== opts.category) return false;
    if (opts.minRating !== undefined && p.rating < opts.minRating) return false;
    if (opts.inStockOnly && !p.inStock) return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

function sortProducts(products: Product[], by: 'price_asc' | 'price_desc' | 'rating'): Product[] {
  const copy = [...products];
  if (by === 'price_asc') return copy.sort((a, b) => a.price - b.price);
  if (by === 'price_desc') return copy.sort((a, b) => b.price - a.price);
  if (by === 'rating') return copy.sort((a, b) => b.rating - a.rating);
  return copy;
}

function calcDiscountedPrice(originalPrice: number, discountPct: number): number {
  if (discountPct < 0 || discountPct > 100) throw new Error('Invalid discount percentage');
  return Math.round((originalPrice * (1 - discountPct / 100)) * 100) / 100;
}

function getRecommendedStack(goal: string): string[] {
  const stacks: Record<string, string[]> = {
    muscle_gain: ['Proteína Whey', 'Creatina', 'BCAA', 'Zinc + Magnesio'],
    fat_loss: ['L-Carnitina', 'CLA', 'Proteína Whey', 'Multivitamínico'],
    endurance: ['Beta-Alanina', 'Electrolitos', 'Carbohidratos', 'Cafeína'],
    recovery: ['Glutamina', 'ZMA', 'Omega-3', 'Proteína de Caseína'],
  };
  return stacks[goal] || stacks['muscle_gain'];
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Proteína Whey Gold', category: 'protein', price: 49.99, rating: 4.8, inStock: true, tags: ['whey', 'muscle', 'vanilla'] },
  { id: '2', name: 'Creatina Monohidrato', category: 'performance', price: 19.99, rating: 4.9, inStock: true, tags: ['creatina', 'fuerza'] },
  { id: '3', name: 'BCAA 2:1:1', category: 'recovery', price: 29.99, rating: 4.5, inStock: false, tags: ['bcaa', 'aminoacidos'] },
  { id: '4', name: 'Pre-entreno Explosivo', category: 'performance', price: 39.99, rating: 4.3, inStock: true, tags: ['cafeina', 'energia'] },
  { id: '5', name: 'Multivitamínico Sport', category: 'health', price: 24.99, rating: 4.6, inStock: true, tags: ['vitaminas', 'minerales'] },
];

describe('Shop — Product Filtering', () => {
  it('returns all products when no filters applied', () => {
    expect(filterProducts(SAMPLE_PRODUCTS, {})).toHaveLength(5);
  });

  it('filters by category correctly', () => {
    const performance = filterProducts(SAMPLE_PRODUCTS, { category: 'performance' });
    expect(performance).toHaveLength(2);
    expect(performance.every(p => p.category === 'performance')).toBe(true);
  });

  it('filters out-of-stock products when inStockOnly=true', () => {
    const inStock = filterProducts(SAMPLE_PRODUCTS, { inStockOnly: true });
    expect(inStock.every(p => p.inStock)).toBe(true);
    expect(inStock).toHaveLength(4);
  });

  it('filters by minimum rating', () => {
    const highRated = filterProducts(SAMPLE_PRODUCTS, { minRating: 4.7 });
    expect(highRated.every(p => p.rating >= 4.7)).toBe(true);
    expect(highRated).toHaveLength(2);
  });

  it('searches by name (case insensitive)', () => {
    const results = filterProducts(SAMPLE_PRODUCTS, { search: 'creatina' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('searches by tags', () => {
    const results = filterProducts(SAMPLE_PRODUCTS, { search: 'aminoacidos' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toContain('BCAA');
  });

  it('combines multiple filters', () => {
    const results = filterProducts(SAMPLE_PRODUCTS, { category: 'performance', inStockOnly: true });
    expect(results).toHaveLength(2);
  });

  it('returns empty array when no matches', () => {
    const results = filterProducts(SAMPLE_PRODUCTS, { category: 'nonexistent' });
    expect(results).toHaveLength(0);
  });
});

describe('Shop — Product Sorting', () => {
  it('sorts by price ascending', () => {
    const sorted = sortProducts(SAMPLE_PRODUCTS, 'price_asc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
    }
  });

  it('sorts by price descending', () => {
    const sorted = sortProducts(SAMPLE_PRODUCTS, 'price_desc');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].price).toBeLessThanOrEqual(sorted[i - 1].price);
    }
  });

  it('sorts by rating highest first', () => {
    const sorted = sortProducts(SAMPLE_PRODUCTS, 'rating');
    expect(sorted[0].rating).toBe(4.9);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].rating).toBeLessThanOrEqual(sorted[i - 1].rating);
    }
  });

  it('does not mutate original array', () => {
    const original = [...SAMPLE_PRODUCTS];
    sortProducts(SAMPLE_PRODUCTS, 'price_asc');
    expect(SAMPLE_PRODUCTS.map(p => p.id)).toEqual(original.map(p => p.id));
  });
});

describe('Shop — Discount Calculation', () => {
  it('calculates 20% discount correctly', () => {
    expect(calcDiscountedPrice(100, 20)).toBe(80);
  });

  it('calculates 0% discount (no change)', () => {
    expect(calcDiscountedPrice(49.99, 0)).toBe(49.99);
  });

  it('calculates 100% discount (free)', () => {
    expect(calcDiscountedPrice(49.99, 100)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    const result = calcDiscountedPrice(29.99, 15);
    expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });

  it('throws on negative discount', () => {
    expect(() => calcDiscountedPrice(100, -5)).toThrow();
  });

  it('throws on discount > 100', () => {
    expect(() => calcDiscountedPrice(100, 110)).toThrow();
  });
});

describe('Shop — Recommended Stacks', () => {
  it('returns muscle gain stack with 4 items', () => {
    const stack = getRecommendedStack('muscle_gain');
    expect(stack.length).toBeGreaterThanOrEqual(4);
    expect(stack.some(s => s.includes('Proteína'))).toBe(true);
    expect(stack.some(s => s.includes('Creatina'))).toBe(true);
  });

  it('returns fat loss stack with L-Carnitina', () => {
    const stack = getRecommendedStack('fat_loss');
    expect(stack.some(s => s.includes('L-Carnitina'))).toBe(true);
  });

  it('returns recovery stack with Glutamina', () => {
    const stack = getRecommendedStack('recovery');
    expect(stack.some(s => s.includes('Glutamina'))).toBe(true);
  });

  it('falls back to muscle gain for unknown goal', () => {
    const fallback = getRecommendedStack('unknown_goal');
    const muscleGain = getRecommendedStack('muscle_gain');
    expect(fallback).toEqual(muscleGain);
  });
});
