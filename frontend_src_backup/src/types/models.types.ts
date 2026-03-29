// ========================
// MODELS TYPES – Derived from Prisma Schema
// ========================

// ─── Auth / User ──────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

// ─── Nutrition ────────────────────────────────────
export interface NutritionProfile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  activityLevel: string;
  goal: string;
  bodyFatPercentage?: number;
  trainingDaysPerWeek?: number;
  tmb?: number;
  tdee?: number;
  targetCalories?: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  userId?: string;
  name: string;
  brand?: string;
  category?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingSizeG?: number;
  servingUnit?: string;
  barcode?: string;
  isVerified: boolean;
  isCustom: boolean;
  createdAt: string;
}

export interface MealLog {
  id: string;
  userId: string;
  foodItemId?: string;
  foodItem?: FoodItem;
  mealType: MealType;
  consumedAt: string;
  quantityG: number;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  satietyLevel?: number;
  mood?: string;
  location?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner' | 'beforeBed';

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  totalCalories?: number;
  isActive: boolean;
  createdAt: string;
  days?: MealPlanDay[];
}

export interface MealPlanDay {
  id: string;
  mealPlanId: string;
  dayNumber: number;
  date?: string;
  totalCalories?: number;
  totalProteinG?: number;
  totalCarbsG?: number;
  totalFatG?: number;
  isCompleted: boolean;
  meals?: Meal[];
}

export interface Meal {
  id: string;
  mealPlanDayId: string;
  mealType: string;
  name: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  preparationTimeMinutes?: number;
  difficultyLevel?: string;
  servings: number;
  instructions?: string;
  imageUrl?: string;
  isFavorite: boolean;
}

export interface NutritionProgress {
  id: string;
  userId: string;
  loggedDate: string;
  totalCalories?: number;
  totalProteinG?: number;
  totalCarbsG?: number;
  totalFatG?: number;
  totalFiberG?: number;
  waterIntakeMl?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  adherencePercentage?: number;
}

export interface Recipe {
  id: string;
  creatorId?: string;
  name: string;
  description?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings: number;
  difficultyLevel?: string;
  caloriesPerServing?: number;
  proteinPerServing?: number;
  carbsPerServing?: number;
  fatPerServing?: number;
  fiberPerServing?: number;
  imageUrl?: string;
  videoUrl?: string;
  isPublic: boolean;
  ratingAvg?: number;
  ratingCount: number;
  createdAt: string;
  ingredients?: RecipeIngredient[];
  instructions?: RecipeInstruction[];
  tags?: RecipeTag[];
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  foodItemId?: string;
  foodItem?: FoodItem;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeInstruction {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
}

export interface RecipeTag {
  id: string;
  recipeId: string;
  tag: string;
}

// ─── Training ─────────────────────────────────────
export interface TrainingProfile {
  id: string;
  userId: string;
  experienceLevel: string;
  trainingYears: number;
  daysPerWeek: number;
  sessionDurationMin: number;
  preferredSplit: string;
  equipmentAvailable: string[];
  injuries?: string;
  goals: string[];
  currentWeightKg: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  type: string;
  equipment: string[];
  difficulty: string;
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tips?: string;
  commonMistakes?: string;
  variations: string[];
  isCustom: boolean;
  creatorId?: string;
  isVerified: boolean;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  trainingDayId?: string;
  workoutDate: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  totalVolume?: number;
  averageRPE?: number;
  energyLevel?: number;
  moodBefore?: string;
  moodAfter?: string;
  notes?: string;
  isCompleted: boolean;
  exercises?: WorkoutExercise[];
  createdAt: string;
}

export interface WorkoutExercise {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  exercise?: Exercise;
  order: number;
  sets: number;
  repsCompleted: string;
  weightKg: number;
  restSeconds?: number;
  rpe?: number;
  isPR: boolean;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exercise?: Exercise;
  weightKg: number;
  reps: number;
  date: string;
  isCurrent: boolean;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  splitType: string;
  durationWeeks: number;
  daysPerWeek: number;
  goal: string;
  experienceLevel: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  currentWeek: number;
  isPredefined: boolean;
}

export interface TrainingProgress {
  id: string;
  userId: string;
  exerciseId: string;
  loggedDate: string;
  oneRepMax?: number;
  estimatedOneRepMax?: number;
  volumeTotal?: number;
  bestSet?: string;
}

// ─── Recovery / Rest ──────────────────────────────
export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  quality: number;
  timeToFallAsleepMin?: number;
  interruptions?: number;
  interruptionsDurationMin?: number;
  sleepStages?: { light: number; deep: number; rem: number; awake: number };
  feelingOnWake?: string;
  naps?: { duration: number; quality: number }[];
  factors: string[];
  notes?: string;
}

export interface RelaxationTechnique {
  id: string;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  instructions?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  benefits: string[];
  bestFor: string[];
  ratingAvg?: number;
  ratingCount: number;
  usageCount: number;
}

export interface RecoveryScore {
  id: string;
  userId: string;
  date: string;
  score: number;
  sleepScore?: number;
  trainingLoadScore?: number;
  stressScore?: number;
  nutritionScore?: number;
  factors?: Record<string, any>;
  recommendations: string[];
}

export interface StretchingRoutine {
  id: string;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  stretches: { name: string; duration: number; side: string }[];
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
  benefits: string[];
  usageCount: number;
}

export interface StressLog {
  id: string;
  userId: string;
  date: string;
  stressLevel: number;
  triggers: string[];
  physicalSymptoms: string[];
  copingMethods: string[];
  notes?: string;
}

// ─── Hydration ────────────────────────────────────
export interface HydrationGoal {
  id: string;
  userId: string;
  dailyGoalMl: number;
  calculatedGoalMl: number;
  weightFactor: number;
  activityFactor: number;
  climateFactor: number;
  supplementAdjustment: number;
  lastCalculated: string;
}

export interface HydrationLog {
  id: string;
  userId: string;
  loggedAt: string;
  amountMl: number;
  liquidType: string;
  liquidName?: string;
  hydrationFactor: number;
  effectiveMl: number;
  context?: string;
  workoutId?: string;
  notes?: string;
}

export interface HydrationReminder {
  id: string;
  userId: string;
  title: string;
  time: string;
  daysOfWeek: number[];
  isActive: boolean;
  smartMode: boolean;
}

export interface HydrationAchievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  level?: number;
  earnedAt: string;
  metadata?: Record<string, any>;
}

// ─── Supplements ──────────────────────────────────
export interface Supplement {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  activeIngredients: { name: string; amount: number; unit: string }[];
  servingSize: string;
  servingsPerContainer: number;
  recommendedDosage: string;
  timing: string[];
  benefits: string[];
  sideEffects: string[];
  evidenceLevel: string;
  averagePrice?: number;
  pricePerServing?: number;
  brands: string[];
  imageUrl?: string;
  isVegan: boolean;
  isGlutenFree: boolean;
  ratingAvg?: number;
  ratingCount: number;
}

export interface UserSupplement {
  id: string;
  userId: string;
  supplementId: string;
  supplement?: Supplement;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expirationDate?: string;
  purchasePrice?: number;
  store?: string;
  dailyDosage: number;
  dosageUnit: string;
  timing: string[];
  isActive: boolean;
  daysRemaining?: number;
  isLowStock: boolean;
  isExpired: boolean;
  notes?: string;
}

export interface SupplementLog {
  id: string;
  userId: string;
  supplementId: string;
  supplement?: Supplement;
  takenAt: string;
  quantity: number;
  timing?: string;
  workoutId?: string;
  energyLevel?: number;
  mood?: string;
  sideEffects: string[];
  effectiveness?: number;
  notes?: string;
}

export interface SupplementStack {
  id: string;
  name: string;
  description?: string;
  goal: string;
  experienceLevel: string;
  monthlyCost?: number;
  isPredefined: boolean;
  isPublic: boolean;
  ratingAvg?: number;
  supplements?: StackSupplement[];
}

export interface StackSupplement {
  id: string;
  stackId: string;
  supplementId: string;
  supplement?: Supplement;
  dailyDosage: number;
  dosageUnit: string;
  timing: string;
  priority: number;
  notes?: string;
}

// ─── Shopping ─────────────────────────────────────
export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'pending' | 'inProgress' | 'completed' | 'archived';
  budget?: number;
  totalEstimated?: number;
  totalReal?: number;
  targetDate?: string;
  completedAt?: string;
  isFromMealPlan: boolean;
  mealPlanId?: string;
  createdAt: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  foodItemId?: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  realPrice?: number;
  brand?: string;
  notes?: string;
  isPurchased: boolean;
  purchasedAt?: string;
  store?: string;
}

export interface PantryItem {
  id: string;
  userId: string;
  foodItemId?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expirationDate?: string;
  location?: string;
  minStock?: number;
  isLowStock: boolean;
  isExpired: boolean;
  notes?: string;
}

export interface PurchaseHistory {
  id: string;
  userId: string;
  shoppingListId?: string;
  purchaseDate: string;
  store?: string;
  totalAmount: number;
  itemsCount: number;
  paymentMethod?: string;
  receipt?: string;
  notes?: string;
}

// ─── Notifications ────────────────────────────────
export interface AppNotification {
  id: string;
  userId?: string;
  type: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  priority: string;
  channel: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  enablePush: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  enableInApp: boolean;
  categories: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  language: string;
  frequency: string;
  maxDaily: number;
}

// ─── Dashboard ────────────────────────────────────
export interface DailySummary {
  calories: { consumed: number; target: number };
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  water: { consumed: number; target: number };
  workoutsThisWeek: number;
  sleepLastNight?: number;
  supplementsTakenToday: number;
  streak: number;
}
