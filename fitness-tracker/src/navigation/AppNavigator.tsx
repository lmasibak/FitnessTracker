"use client"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { ActivityIndicator, View } from "react-native"
import { Home, Dumbbell, Utensils, User, Calendar } from "lucide-react-native"
import { useAuth } from "../context/AuthContext"

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen"
import SignupScreen from "../screens/auth/SignupScreen"
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen"

// Main Screens
import HomeScreen from "../screens/HomeScreen"
import WorkoutsScreen from "../screens/workout/WorkoutsScreen"
import WorkoutDetailScreen from "../screens/workout/WorkoutDetailScreen"
import CreateWorkoutScreen from "../screens/workout/CreateWorkoutScreen"
import NutritionScreen from "../screens/nutrition/NutritionScreen"
import MealDetailScreen from "../screens/nutrition/MealDetailScreen"
import AddFoodScreen from "../screens/nutrition/AddFoodScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import EditProfileScreen from "../screens/profile/EditProfileScreen"
import SettingsScreen from "../screens/profile/SettingsScreen"
import PlanScreen from "../screens/plan/PlanScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

const WorkoutStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WorkoutsScreen" component={WorkoutsScreen} options={{ title: "Workouts" }} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: "Workout Details" }} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} options={{ title: "Create Workout" }} />
    </Stack.Navigator>
  )
}

const NutritionStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NutritionScreen" component={NutritionScreen} options={{ title: "Nutrition" }} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} options={{ title: "Meal Details" }} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ title: "Add Food" }} />
    </Stack.Navigator>
  )
}

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Stack.Navigator>
  )
}

const PlanStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlanScreen" component={PlanScreen} options={{ title: "Plans" }} />
    </Stack.Navigator>
  )
}

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") {
            return <Home size={size} color={color} />
          } else if (route.name === "Workouts") {
            return <Dumbbell size={size} color={color} />
          } else if (route.name === "Nutrition") {
            return <Utensils size={size} color={color} />
          } else if (route.name === "Profile") {
            return <User size={size} color={color} />
          } else if (route.name === "Plan") {
            return <Calendar size={size} color={color} />
          }
        },
        tabBarActiveTintColor: "#FF5722",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Workouts" component={WorkoutStack} options={{ headerShown: false }} />
      <Tab.Screen name="Nutrition" component={NutritionStack} options={{ headerShown: false }} />
      <Tab.Screen name="Plan" component={PlanStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator

