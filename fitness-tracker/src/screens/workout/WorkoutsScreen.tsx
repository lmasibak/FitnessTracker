"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { fetchWorkouts } from "../../redux/slices/workoutsSlice"
import { Calendar, Dumbbell, Plus } from "lucide-react-native"
import { format, parseISO } from "date-fns"

const WorkoutsScreen = () => {
  const { user } = useAuth()
  const { colors } = useTheme()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  const workouts = useSelector((state) => state.workouts.workouts)
  const loading = useSelector((state) => state.workouts.loading)

  useEffect(() => {
    if (user) {
      dispatch(fetchWorkouts(user.uid))
    }
  }, [dispatch, user])

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true)
      await dispatch(fetchWorkouts(user.uid))
      setRefreshing(false)
    }
  }

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
    workoutItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 20,
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    workoutHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    workoutTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    workoutDate: {
      fontSize: 12,
      color: colors.text + "80",
    },
    workoutDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    workoutStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    workoutStat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 15,
    },
    workoutStatText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 5,
    },
    completedBadge: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    completedText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: "500",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  })

  const renderWorkoutItem = ({ item }) => {
    const formattedDate = format(parseISO(item.date), "MMM dd, yyyy")

    return (
      <TouchableOpacity
        style={styles.workoutItem}
        onPress={() => navigation.navigate("WorkoutDetail", { workoutId: item.id })}
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{item.title}</Text>
          <Text style={styles.workoutDate}>{formattedDate}</Text>
        </View>

        <View style={styles.workoutDetails}>
          <View style={styles.workoutStats}>
            <View style={styles.workoutStat}>
              <Dumbbell size={16} color={colors.text} />
              <Text style={styles.workoutStatText}>{item.exercises.length} exercises</Text>
            </View>

            <View style={styles.workoutStat}>
              <Calendar size={16} color={colors.text} />
              <Text style={styles.workoutStatText}>{item.duration} min</Text>
            </View>
          </View>

          {item.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateWorkout")}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Dumbbell size={60} color={colors.primary} />
          <Text style={styles.emptyText}>
            You haven't logged any workouts yet. Tap the + button to add your first workout!
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 10 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  )
}

export default WorkoutsScreen

