import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { collection, getDocs, getDoc, addDoc, query, where, orderBy } from "firebase/firestore"
import { firestore } from "../../firebase/config"

export interface ProgressEntry {
  id: string
  userId: string
  date: string
  weight?: number
  bodyFat?: number
  measurements?: {
    chest?: number
    waist?: number
    hips?: number
    arms?: number
    thighs?: number
  }
  notes?: string
  createdAt: any
}

interface ProgressState {
  entries: ProgressEntry[]
  loading: boolean
  error: string | null
}

const initialState: ProgressState = {
  entries: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchProgressEntries = createAsyncThunk("progress/fetchProgressEntries", async (userId: string) => {
  const progressRef = collection(firestore, "progress")
  const q = query(progressRef, where("userId", "==", userId), orderBy("date", "desc"))

  const querySnapshot = await getDocs(q)
  const entries = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProgressEntry[]

  return entries
})

export const addProgressEntry = createAsyncThunk(
  "progress/addProgressEntry",
  async (entryData: Omit<ProgressEntry, "id">) => {
    const progressRef = collection(firestore, "progress")
    const docRef = await addDoc(progressRef, {
      ...entryData,
      createdAt: new Date(),
    })

    const newEntry = await getDoc(docRef)
    return { id: docRef.id, ...newEntry.data() } as ProgressEntry
  },
)

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch progress entries
      .addCase(fetchProgressEntries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProgressEntries.fulfilled, (state, action) => {
        state.entries = action.payload
        state.loading = false
      })
      .addCase(fetchProgressEntries.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch progress entries"
      })

      // Add progress entry
      .addCase(addProgressEntry.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addProgressEntry.fulfilled, (state, action) => {
        state.entries.unshift(action.payload)
        state.loading = false
      })
      .addCase(addProgressEntry.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to add progress entry"
      })
  },
})

export default progressSlice.reducer

