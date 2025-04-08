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

export interface WorkoutPlan {
  id: string
  userId: string
  title: string
  description?: string
  days: {
    [key: string]: {
      title: string
      exercises: Array<{
        name: string
        sets: number
        reps: number
        notes?: string
      }>
    }
  }
  startDate?: string
  endDate?: string
  isActive: boolean
  createdAt: any
}

interface PlansState {
  workoutPlans: WorkoutPlan[]
  currentPlan: WorkoutPlan | null
  loading: boolean
  error: string | null
}

const initialState: PlansState = {
  workoutPlans: [],
  currentPlan: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchWorkoutPlans = createAsyncThunk("plans/fetchWorkoutPlans", async (userId: string) => {
  const plansRef = collection(firestore, "workoutPlans")
  const q = query(plansRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  const plans = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as WorkoutPlan[]

  return plans
})

export const fetchWorkoutPlanById = createAsyncThunk("plans/fetchWorkoutPlanById", async (planId: string) => {
  const planRef = doc(firestore, "workoutPlans", planId)
  const planDoc = await getDoc(planRef)

  if (planDoc.exists()) {
    return { id: planDoc.id, ...planDoc.data() } as WorkoutPlan
  } else {
    throw new Error("Workout plan not found")
  }
})

export const createWorkoutPlan = createAsyncThunk(
  "plans/createWorkoutPlan",
  async (planData: Omit<WorkoutPlan, "id">) => {
    const plansRef = collection(firestore, "workoutPlans")
    const docRef = await addDoc(plansRef, {
      ...planData,
      createdAt: new Date(),
    })

    const newPlan = await getDoc(docRef)
    return { id: docRef.id, ...newPlan.data() } as WorkoutPlan
  },
)

export const updateWorkoutPlan = createAsyncThunk(
  "plans/updateWorkoutPlan",
  async ({ id, data }: { id: string; data: Partial<WorkoutPlan> }) => {
    const planRef = doc(firestore, "workoutPlans", id)
    await updateDoc(planRef, data)

    const updatedPlan = await getDoc(planRef)
    return { id, ...updatedPlan.data() } as WorkoutPlan
  },
)

export const deleteWorkoutPlan = createAsyncThunk("plans/deleteWorkoutPlan", async (planId: string) => {
  const planRef = doc(firestore, "workoutPlans", planId)
  await deleteDoc(planRef)
  return planId
})

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearCurrentPlan: (state) => {
      state.currentPlan = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workout plans
      .addCase(fetchWorkoutPlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkoutPlans.fulfilled, (state, action) => {
        state.workoutPlans = action.payload
        state.loading = false
      })
      .addCase(fetchWorkoutPlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch workout plans"
      })

      // Fetch workout plan by id
      .addCase(fetchWorkoutPlanById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkoutPlanById.fulfilled, (state, action) => {
        state.currentPlan = action.payload
        state.loading = false
      })
      .addCase(fetchWorkoutPlanById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch workout plan"
      })

      // Create workout plan
      .addCase(createWorkoutPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createWorkoutPlan.fulfilled, (state, action) => {
        state.workoutPlans.unshift(action.payload)
        state.currentPlan = action.payload
        state.loading = false
      })
      .addCase(createWorkoutPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create workout plan"
      })

      // Update workout plan
      .addCase(updateWorkoutPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateWorkoutPlan.fulfilled, (state, action) => {
        const index = state.workoutPlans.findIndex((plan) => plan.id === action.payload.id)
        if (index !== -1) {
          state.workoutPlans[index] = action.payload
        }
        state.currentPlan = action.payload
        state.loading = false
      })
      .addCase(updateWorkoutPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to update workout plan"
      })

      // Delete workout plan
      .addCase(deleteWorkoutPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteWorkoutPlan.fulfilled, (state, action) => {
        state.workoutPlans = state.workoutPlans.filter((plan) => plan.id !== action.payload)
        if (state.currentPlan && state.currentPlan.id === action.payload) {
          state.currentPlan = null
        }
        state.loading = false
      })
      .addCase(deleteWorkoutPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to delete workout plan"
      })
  },
})

export const { clearCurrentPlan } = plansSlice.actions
export default plansSlice.reducer

