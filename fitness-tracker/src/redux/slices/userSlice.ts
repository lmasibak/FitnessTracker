import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { firestore } from "../../firebase/config"

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  height?: number
  weight?: number
  goals?: string[]
  preferences: {
    notifications: boolean
    darkMode: boolean
    units: "metric" | "imperial"
  }
  createdAt: any
}

interface UserState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchUserProfile = createAsyncThunk("user/fetchUserProfile", async (userId: string) => {
  const userRef = doc(firestore, "users", userId)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    return userDoc.data() as UserProfile
  } else {
    throw new Error("User profile not found")
  }
})

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async ({ userId, data }: { userId: string; data: Partial<UserProfile> }) => {
    const userRef = doc(firestore, "users", userId)
    await updateDoc(userRef, data)

    const updatedUser = await getDoc(userRef)
    return updatedUser.data() as UserProfile
  },
)

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch user profile"
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.loading = false
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to update user profile"
      })
  },
})

export const { clearUserProfile } = userSlice.actions
export default userSlice.reducer

