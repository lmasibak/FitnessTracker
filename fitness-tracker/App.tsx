import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider } from "react-redux"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "react-native"
import { store } from "./src/redux/store"
import AppNavigator from "./src/navigation/AppNavigator"
import { ThemeProvider } from "./src/context/ThemeContext"
import { AuthProvider } from "./src/context/AuthContext"

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  )
}

