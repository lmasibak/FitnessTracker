"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { fetchWorkouts } from "../redux/slices/workoutsSlice"
import { fetchMeals } from "../redux/slices/nutritionSlice"
import { fetchUserProfile } from "../redux/slices/userSlice"
import { fetchProgressEntries } from "../redux/slices/progressSlice"
import { BarChart, LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { format, subDays } from "date-fns"
import { Calendar, ChevronRight, Dumbbell, Utensils } from "lucide-react-native"

const HomeScreen = () => {
  const { user } = useAuth()
  const { colors, isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)

  const userProfile = useSelector((state) => state.user.profile)
  const workouts = useSelector((state) => state.workouts.workouts)
  const meals = useSelector((state) => state.nutrition.meals)
  const dailySummary = useSelector((state) => state.nutrition.dailySummary)
  const progressEntries = useSelector((state) => state.progress.entries)

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true)
          const today = format(new Date(), "yyyy-MM-dd")

          await Promise.all([
            dispatch(fetchUserProfile(user.uid)),
            dispatch(fetchWorkouts(user.uid)),
            dispatch(fetchMeals({ userId: user.uid, date: today })),
            dispatch(fetchProgressEntries(user.uid)),
          ])
        } catch (error) {
          console.error("Error loading home data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [dispatch, user])

  const screenWidth = Dimensions.get("window").width - 40

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },
    subheading: {
      fontSize: 16,
      color: colors.text + "80",
      marginBottom: 10,
    },
    section: {
      marginBottom: 20,
      padding: 15,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    seeAll: {
      color: colors.primary,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    cardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    stat: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text + "80",
    },
    workoutItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    workoutIcon: {
      backgroundColor: colors.primary + "20",
      padding: 10,
      borderRadius: 10,
      marginRight: 10,
    },
    workoutInfo: {
      flex: 1,
    },
    workoutTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    workoutMeta: {
      fontSize: 12,
      color: colors.text + "80",
    },
    chartContainer: {
      alignItems: "center",
      marginVertical: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 15,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 5,
    },
    actionButtonText: {
      color: "white",
      marginTop: 5,
      fontWeight: "500",
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // Format data for charts
  const nutritionData = {
    labels: ["Protein", "Carbs", "Fat"],
    datasets: [
      {
        data: [dailySummary?.totalProtein || 0, dailySummary?.totalCarbs || 0, dailySummary?.totalFat || 0],
      },
    ],
  }

  // Get last 7 days of weight data
  const last7DaysWeight = []
  const last7DaysLabels = []

  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd")
    const entry = progressEntries.find((entry) => entry.date === date)

    last7DaysWeight.push(entry?.weight || 0)
    last7DaysLabels.push(format(subDays(new Date(), i), "dd"))
  }

  const weightData = {
    labels: last7DaysLabels,
    datasets: [
      {
        data: last7DaysWeight.every((w) => w === 0) ? [60, 61, 62, 61, 63, 62, 63] : last7DaysWeight,
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => colors.text + opacity * 100,
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userProfile?.displayName || user?.displayName || "there"}!</Text>
          <Text style={styles.subheading}>Let's check your progress today</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Workouts", { screen: "CreateWorkout" })}
          >
            <Dumbbell color="white" size={24} />
            <Text style={styles.actionButtonText}>Add Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Nutrition", { screen: "AddFood" })}
          >
            <Utensils color="white" size={24} />
            <Text style={styles.actionButtonText}>Log Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Plan")}>
            <Calendar color="white" size={24} />
            <Text style={styles.actionButtonText}>View Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nutrition</Text>
            <View style={styles.cardContent}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{dailySummary?.totalCalories || 0}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{dailySummary?.totalProtein || 0}g</Text>
                <Text style={styles.statLabel}>Protein</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{dailySummary?.totalCarbs || 0}g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{dailySummary?.totalFat || 0}g</Text>
                <Text style={styles.statLabel}>Fat</Text>
              </View>
            </View>

            {dailySummary && (
              <View style={styles.chartContainer}>
                <BarChart
                  data={nutritionData}
                  width={screenWidth}
                  height={180}
                  chartConfig={chartConfig}
                  yAxisSuffix="g"
                  fromZero
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Workouts")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {workouts.length > 0 ? (
              workouts.slice(0, 3).map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutItem}
                  onPress={() =>
                    navigation.navigate("Workouts", {
                      screen: "WorkoutDetail",
                      params: { workoutId: workout.id },
                    })
                  }
                >
                  <View style={styles.workoutIcon}>
                    <Dumbbell color={colors.primary} size={20} />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                    <Text style={styles.workoutMeta}>
                      {workout.exercises.length} exercises • {workout.duration} min
                    </Text>
                  </View>
                  <ChevronRight color={colors.text + "80"} size={20} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: colors.text, textAlign: "center" }}>No recent workouts. Start tracking today!</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weight Progress</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Profile", { screen: "ProfileScreen" })}>
              <Text style={styles.seeAll}>Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.chartContainer}>
              <LineChart
                data={weightData}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                bezier
                yAxisSuffix="kg"
                fromZero={false}
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={() => navigation.navigate("Profile", { screen: "ProfileScreen" })}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default HomeScreen

