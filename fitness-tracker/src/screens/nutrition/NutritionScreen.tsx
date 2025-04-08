"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { fetchMeals } from "../../redux/slices/nutritionSlice"
import { ChevronLeft, ChevronRight, Plus, Utensils } from "lucide-react-native"
import { format, addDays } from "date-fns"

const NutritionScreen = () => {
  const { user } = useAuth()
  const { colors } = useTheme()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const meals = useSelector((state) => state.nutrition.meals)
  const dailySummary = useSelector((state) => state.nutrition.dailySummary)
  const loading = useSelector((state) => state.nutrition.loading)

  useEffect(() => {
    if (user) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      dispatch(fetchMeals({ userId: user.uid, date: formattedDate }))
    }
  }, [dispatch, user, selectedDate])

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true)
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      await dispatch(fetchMeals({ userId: user.uid, date: formattedDate }))
      setRefreshing(false)
    }
  }

  const handlePreviousDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, -1))
  }

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1))
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dateSelector: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    dateText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    dateButton: {
      padding: 5,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginTop: 10,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.text + "80",
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginTop: 10,
    },
    progressFill: {
      height: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
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
    mealItem: {
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
    mealHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    mealTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    mealType: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
    },
    mealStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    mealStat: {
      alignItems: "center",
      flex: 1,
    },
    mealStatValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    mealStatLabel: {
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

  const renderMealItem = ({ item }) => {
    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return (
      <TouchableOpacity style={styles.mealItem} onPress={() => navigation.navigate("MealDetail", { mealId: item.id })}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{item.name}</Text>
          <Text style={styles.mealType}>{capitalizeFirstLetter(item.mealType)}</Text>
        </View>

        <View style={styles.mealStats}>
          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{item.totalCalories}</Text>
            <Text style={styles.mealStatLabel}>Calories</Text>
          </View>

          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{item.totalProtein}g</Text>
            <Text style={styles.mealStatLabel}>Protein</Text>
          </View>

          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{item.totalCarbs}g</Text>
            <Text style={styles.mealStatLabel}>Carbs</Text>
          </View>

          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{item.totalFat}g</Text>
            <Text style={styles.mealStatLabel}>Fat</Text>
          </View>
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

  // Assume a daily calorie goal of 2000 for progress bar
  const calorieGoal = 2000
  const calorieProgress = dailySummary ? (dailySummary.totalCalories / calorieGoal) * 100 : 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateButton} onPress={handlePreviousDay}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.dateText}>{format(selectedDate, "EEEE, MMMM d, yyyy")}</Text>

          <TouchableOpacity style={styles.dateButton} onPress={handleNextDay}>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Calories</Text>
            <Text style={styles.summaryValue}>
              {dailySummary?.totalCalories || 0} / {calorieGoal} kcal
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Protein</Text>
            <Text style={styles.summaryValue}>{dailySummary?.totalProtein || 0}g</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Carbs</Text>
            <Text style={styles.summaryValue}>{dailySummary?.totalCarbs || 0}g</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fat</Text>
            <Text style={styles.summaryValue}>{dailySummary?.totalFat || 0}g</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(calorieProgress, 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddFood")}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Utensils size={60} color={colors.primary} />
          <Text style={styles.emptyText}>No meals logged for this day. Tap the + button to add a meal!</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 10 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  )
}

export default NutritionScreen

