import { configureStore } from "@reduxjs/toolkit"
import workoutsReducer from "./slices/workoutsSlice"
import nutritionReducer from "./slices/nutritionSlice"
import userReducer from "./slices/userSlice"
import settingsReducer from "./slices/settingsSlice"
import progressReducer from "./slices/progressSlice"
import plansReducer from "./slices/plansSlice"

export const store = configureStore({
  reducer: {
    workouts: workoutsReducer,
    nutrition: nutritionReducer,
    user: userReducer,
    settings: settingsReducer,
    progress: progressReducer,
    plans: plansReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

