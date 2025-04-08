import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface SettingsState {
  theme: "light" | "dark" | "system"
  notifications: boolean
  units: "metric" | "imperial"
}

const initialState: SettingsState = {
  theme: "system",
  notifications: true,
  units: "metric",
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications
    },
    setUnits: (state, action: PayloadAction<"metric" | "imperial">) => {
      state.units = action.payload
    },
    resetSettings: () => initialState,
  },
})

export const { setTheme, toggleNotifications, setUnits, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer

