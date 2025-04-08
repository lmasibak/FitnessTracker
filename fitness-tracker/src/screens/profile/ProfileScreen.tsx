"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { fetchUserProfile } from "../../redux/slices/userSlice"
import { fetchProgressEntries } from "../../redux/slices/progressSlice"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { format, subDays } from "date-fns"
import { Camera, ChevronRight, Edit, LogOut, Moon, Settings } from "lucide-react-native"

const ProfileScreen = () => {
  const { user, logout } = useAuth()
  const { colors, isDarkMode, toggleTheme } = useTheme()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)

  const userProfile = useSelector((state) => state.user.profile)
  const progressEntries = useSelector((state) => state.progress.entries)

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true)
          await Promise.all([dispatch(fetchUserProfile(user.uid)), dispatch(fetchProgressEntries(user.uid))])
        } catch (error) {
          console.error("Error loading profile data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [dispatch, user])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const screenWidth = Dimensions.get("window").width - 40

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    cameraButton: {
      position: "absolute",
      bottom: 10,
      right: 130,
      backgroundColor: colors.primary,
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 16,
      color: colors.text + "80",
      marginBottom: 15,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    editButtonText: {
      color: "white",
      marginLeft: 5,
      fontWeight: "500",
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
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    statItem: {
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
    chartContainer: {
      alignItems: "center",
      marginVertical: 10,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemIcon: {
      marginRight: 15,
      backgroundColor: colors.primary + "20",
      padding: 10,
      borderRadius: 10,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
      marginHorizontal: 20,
      padding: 15,
      backgroundColor: colors.error + "20",
      borderRadius: 12,
    },
    logoutText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 10,
    },
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // Format data for weight chart
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Image
            source={{ uri: userProfile?.photoURL || "https://via.placeholder.com/100" }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={18} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{userProfile?.displayName || user?.displayName}</Text>
        <Text style={styles.userEmail}>{userProfile?.email || user?.email}</Text>

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile")}>
          <Edit size={16} color="white" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stats</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.weight || "0"}</Text>
              <Text style={styles.statLabel}>Weight (kg)</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.height || "0"}</Text>
              <Text style={styles.statLabel}>Height (cm)</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userProfile?.weight && userProfile?.height
                  ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)
                  : "0"}
              </Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Weight Progress</Text>
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
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Settings size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <ChevronRight size={20} color={colors.text + "80"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Moon size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Dark Mode</Text>
          </View>
          <View
            style={{
              width: 50,
              height: 30,
              backgroundColor: isDarkMode ? colors.primary : colors.border,
              borderRadius: 15,
              justifyContent: "center",
              paddingHorizontal: 5,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "white",
                alignSelf: isDarkMode ? "flex-end" : "flex-start",
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default ProfileScreen

