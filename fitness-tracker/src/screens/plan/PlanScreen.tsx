"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { fetchWorkoutPlans } from "../../redux/slices/plansSlice"
import { Dumbbell, Plus } from "lucide-react-native"
import { format, addDays, startOfWeek } from "date-fns"

const PlanScreen = () => {
  const { user } = useAuth()
  const { colors } = useTheme()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const workoutPlans = useSelector((state) => state.plans.workoutPlans)

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true)
          await dispatch(fetchWorkoutPlans(user.uid))
        } catch (error) {
          console.error("Error loading plans:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [dispatch, user])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    weekView: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dayItem: {
      alignItems: "center",
      width: 40,
    },
    dayName: {
      fontSize: 12,
      color: colors.text + "80",
      marginBottom: 5,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    selectedDay: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedDayText: {
      color: "white",
    },
    section: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
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
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    planTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    activeBadge: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    activeText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: "500",
    },
    planDescription: {
      fontSize: 14,
      color: colors.text + "80",
      marginBottom: 10,
    },
    exerciseItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    exerciseIcon: {
      backgroundColor: colors.primary + "20",
      padding: 10,
      borderRadius: 10,
      marginRight: 10,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    exerciseMeta: {
      fontSize: 12,
      color: colors.text + "80",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text + "80",
      textAlign: "center",
      marginTop: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // Generate week days
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfCurrentWeek, i)
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isSelected: format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
    }
  })

  // Get active plan
  const activePlan = workoutPlans.find((plan) => plan.isActive)

  // Get today's workout from active plan
  const dayOfWeek = format(selectedDate, "EEEE").toLowerCase()
  const todaysWorkout = activePlan?.days[dayOfWeek]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plan</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekView}>
        {weekDays.map((day, index) => (
          <TouchableOpacity key={index} style={styles.dayItem} onPress={() => setSelectedDate(day.date)}>
            <Text style={styles.dayName}>{day.dayName}</Text>
            <View style={day.isSelected ? styles.selectedDay : null}>
              <Text style={day.isSelected ? styles.selectedDayText : styles.dayNumber}>{day.dayNumber}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Plan</Text>
          </View>

          {activePlan ? (
            <View style={styles.card}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{activePlan.title}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>

              {activePlan.description && <Text style={styles.planDescription}>{activePlan.description}</Text>}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={{ color: colors.text, textAlign: "center" }}>
                No active plan. Create a new workout plan to get started!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{format(selectedDate, "EEEE")}'s Workout</Text>
          </View>

          {todaysWorkout ? (
            <View style={styles.card}>
              <Text style={styles.planTitle}>{todaysWorkout.title}</Text>

              {todaysWorkout.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseIcon}>
                    <Dumbbell size={20} color={colors.primary} />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {exercise.sets} sets × {exercise.reps} reps
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={{ color: colors.text, textAlign: "center" }}>
                No workout scheduled for {format(selectedDate, "EEEE")}.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Plans</Text>
          </View>

          {workoutPlans.length > 0 ? (
            workoutPlans.map((plan) => (
              <TouchableOpacity key={plan.id} style={styles.card}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {plan.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  )}
                </View>

                {plan.description && <Text style={styles.planDescription}>{plan.description}</Text>}

                <Text style={styles.exerciseMeta}>{Object.keys(plan.days).length} days per week</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.card}>
              <Text style={{ color: colors.text, textAlign: "center" }}>No workout plans created yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default PlanScreen

