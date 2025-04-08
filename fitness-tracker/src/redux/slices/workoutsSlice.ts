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

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
  duration?: number
  notes?: string
}

export interface Workout {
  id: string
  userId: string
  title: string
  description?: string
  exercises: Exercise[]
  duration: number
  caloriesBurned?: number
  date: string
  completed: boolean
  createdAt: any
}

interface WorkoutsState {
  workouts: Workout[]
  currentWorkout: Workout | null
  loading: boolean
  error: string | null
}

const initialState: WorkoutsState = {
  workouts: [],
  currentWorkout: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchWorkouts = createAsyncThunk("workouts/fetchWorkouts", async (userId: string) => {
  const workoutsRef = collection(firestore, "workouts")
  const q = query(workoutsRef, where("userId", "==", userId), orderBy("date", "desc"))

  const querySnapshot = await getDocs(q)
  const workouts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Workout[]

  return workouts
})

export const fetchWorkoutById = createAsyncThunk("workouts/fetchWorkoutById", async (workoutId: string) => {
  const workoutRef = doc(firestore, "workouts", workoutId)
  const workoutDoc = await getDoc(workoutRef)

  if (workoutDoc.exists()) {
    return { id: workoutDoc.id, ...workoutDoc.data() } as Workout
  } else {
    throw new Error("Workout not found")
  }
})

export const createWorkout = createAsyncThunk("workouts/createWorkout", async (workoutData: Omit<Workout, "id">) => {
  const workoutsRef = collection(firestore, "workouts")
  const docRef = await addDoc(workoutsRef, {
    ...workoutData,
    createdAt: new Date(),
  })

  const newWorkout = await getDoc(docRef)
  return { id: docRef.id, ...newWorkout.data() } as Workout
})

export const updateWorkout = createAsyncThunk(
  "workouts/updateWorkout",
  async ({ id, data }: { id: string; data: Partial<Workout> }) => {
    const workoutRef = doc(firestore, "workouts", id)
    await updateDoc(workoutRef, data)

    const updatedWorkout = await getDoc(workoutRef)
    return { id, ...updatedWorkout.data() } as Workout
  },
)

export const deleteWorkout = createAsyncThunk("workouts/deleteWorkout", async (workoutId: string) => {
  const workoutRef = doc(firestore, "workouts", workoutId)
  await deleteDoc(workoutRef)
  return workoutId
})

const workoutsSlice = createSlice({
  name: "workouts",
  initialState,
  reducers: {
    clearCurrentWorkout: (state) => {
      state.currentWorkout = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workouts
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.workouts = action.payload
        state.loading = false
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch workouts"
      })

      // Fetch workout by id
      .addCase(fetchWorkoutById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkoutById.fulfilled, (state, action) => {
        state.currentWorkout = action.payload
        state.loading = false
      })
      .addCase(fetchWorkoutById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch workout"
      })

      // Create workout
      .addCase(createWorkout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createWorkout.fulfilled, (state, action) => {
        state.workouts.unshift(action.payload)
        state.currentWorkout = action.payload
        state.loading = false
      })
      .addCase(createWorkout.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create workout"
      })

      // Update workout
      .addCase(updateWorkout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        const index = state.workouts.findIndex((workout) => workout.id === action.payload.id)
        if (index !== -1) {
          state.workouts[index] = action.payload
        }
        state.currentWorkout = action.payload
        state.loading = false
      })
      .addCase(updateWorkout.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to update workout"
      })

      // Delete workout
      .addCase(deleteWorkout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.workouts = state.workouts.filter((workout) => workout.id !== action.payload)
        if (state.currentWorkout && state.currentWorkout.id === action.payload) {
          state.currentWorkout = null
        }
        state.loading = false
      })
      .addCase(deleteWorkout.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to delete workout"
      })
  },
})

export const { clearCurrentWorkout } = workoutsSlice.actions
export default workoutsSlice.reducer

