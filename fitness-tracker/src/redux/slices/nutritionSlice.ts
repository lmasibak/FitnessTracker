import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { firestore } from "../../firebase/config"

export interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
  servingUnit: string
  quantity: number
}

export interface Meal {
  id: string
  userId: string
  name: string
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  date: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  createdAt: any
}

interface NutritionState {
  meals: Meal[]
  currentMeal: Meal | null
  dailySummary: {
    date: string
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: NutritionState = {
  meals: [],
  currentMeal: null,
  dailySummary: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchMeals = createAsyncThunk(
  "nutrition/fetchMeals",
  async ({ userId, date }: { userId: string; date: string }) => {
    const mealsRef = collection(firestore, "meals")
    const q = query(mealsRef, where("userId", "==", userId), where("date", "==", date), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const meals = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meal[]

    // Calculate daily summary
    const dailySummary = {
      date,
      totalCalories: meals.reduce((sum, meal) => sum + meal.totalCalories, 0),
      totalProtein: meals.reduce((sum, meal) => sum + meal.totalProtein, 0),
      totalCarbs: meals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      totalFat: meals.reduce((sum, meal) => sum + meal.totalFat, 0),
    }

    return { meals, dailySummary }
  },
)

export const fetchMealById = createAsyncThunk("nutrition/fetchMealById", async (mealId: string) => {
  const mealRef = doc(firestore, "meals", mealId)
  const mealDoc = await getDoc(mealRef)

  if (mealDoc.exists()) {
    return { id: mealDoc.id, ...mealDoc.data() } as Meal
  } else {
    throw new Error("Meal not found")
  }
})

export const createMeal = createAsyncThunk("nutrition/createMeal", async (mealData: Omit<Meal, "id">) => {
  const mealsRef = collection(firestore, "meals")
  const docRef = await addDoc(mealsRef, {
    ...mealData,
    createdAt: new Date(),
  })

  const newMeal = await getDoc(docRef)
  return { id: docRef.id, ...newMeal.data() } as Meal
})

export const updateMeal = createAsyncThunk(
  "nutrition/updateMeal",
  async ({ id, data }: { id: string; data: Partial<Meal> }) => {
    const mealRef = doc(firestore, "meals", id)
    await updateDoc(mealRef, data)

    const updatedMeal = await getDoc(mealRef)
    return { id, ...updatedMeal.data() } as Meal
  },
)

export const deleteMeal = createAsyncThunk("nutrition/deleteMeal", async (mealId: string) => {
  const mealRef = doc(firestore, "meals", mealId)
  await deleteDoc(mealRef)
  return mealId
})

const nutritionSlice = createSlice({
  name: "nutrition",
  initialState,
  reducers: {
    clearCurrentMeal: (state) => {
      state.currentMeal = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meals
      .addCase(fetchMeals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.meals = action.payload.meals
        state.dailySummary = action.payload.dailySummary
        state.loading = false
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch meals"
      })

      // Fetch meal by id
      .addCase(fetchMealById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMealById.fulfilled, (state, action) => {
        state.currentMeal = action.payload
        state.loading = false
      })
      .addCase(fetchMealById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch meal"
      })

      // Create meal
      .addCase(createMeal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createMeal.fulfilled, (state, action) => {
        state.meals.unshift(action.payload)
        state.currentMeal = action.payload

        // Update daily summary
        if (state.dailySummary && state.dailySummary.date === action.payload.date) {
          state.dailySummary.totalCalories += action.payload.totalCalories
          state.dailySummary.totalProtein += action.payload.totalProtein
          state.dailySummary.totalCarbs += action.payload.totalCarbs
          state.dailySummary.totalFat += action.payload.totalFat
        }

        state.loading = false
      })
      .addCase(createMeal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create meal"
      })

      // Update meal
      .addCase(updateMeal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        const index = state.meals.findIndex((meal) => meal.id === action.payload.id)
        if (index !== -1) {
          // Calculate difference in nutritional values
          const oldMeal = state.meals[index]
          const caloriesDiff = action.payload.totalCalories - oldMeal.totalCalories
          const proteinDiff = action.payload.totalProtein - oldMeal.totalProtein
          const carbsDiff = action.payload.totalCarbs - oldMeal.totalCarbs
          const fatDiff = action.payload.totalFat - oldMeal.totalFat

          // Update meal in array
          state.meals[index] = action.payload

          // Update daily summary if it exists and dates match
          if (state.dailySummary && state.dailySummary.date === action.payload.date) {
            state.dailySummary.totalCalories += caloriesDiff
            state.dailySummary.totalProtein += proteinDiff
            state.dailySummary.totalCarbs += carbsDiff
            state.dailySummary.totalFat += fatDiff
          }
        }
        state.currentMeal = action.payload
        state.loading = false
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to update meal"
      })

      // Delete meal
      .addCase(deleteMeal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        const deletedMeal = state.meals.find((meal) => meal.id === action.payload)
        state.meals = state.meals.filter((meal) => meal.id !== action.payload)

        // Update daily summary if the meal exists and dates match
        if (deletedMeal && state.dailySummary && state.dailySummary.date === deletedMeal.date) {
          state.dailySummary.totalCalories -= deletedMeal.totalCalories
          state.dailySummary.totalProtein -= deletedMeal.totalProtein
          state.dailySummary.totalCarbs -= deletedMeal.totalCarbs
          state.dailySummary.totalFat -= deletedMeal.totalFat
        }

        if (state.currentMeal && state.currentMeal.id === action.payload) {
          state.currentMeal = null
        }
        state.loading = false
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to delete meal"
      })
  },
})

export const { clearCurrentMeal } = nutritionSlice.actions
export default nutritionSlice.reducer

