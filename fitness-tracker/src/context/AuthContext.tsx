"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Alert } from "react-native"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { firestore } from "../firebase/config"

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>
  updateUserData: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      // Create user document in Firestore
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        createdAt: new Date(),
        height: null,
        weight: null,
        goals: [],
        preferences: {
          notifications: true,
          darkMode: false,
          units: "metric",
        },
      })

      return userCredential
    } catch (error: any) {
      Alert.alert("Error", error.message)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      Alert.alert("Error", error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      Alert.alert("Error", error.message)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert("Success", "Password reset email sent")
    } catch (error: any) {
      Alert.alert("Error", error.message)
      throw error
    }
  }

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      if (user) {
        await updateProfile(user, data)
        // Force refresh
        setUser({ ...user })
      }
    } catch (error: any) {
      Alert.alert("Error", error.message)
      throw error
    }
  }

  const updateUserData = async (data: any) => {
    try {
      if (user) {
        const userRef = doc(firestore, "users", user.uid)
        await updateDoc(userRef, data)
      }
    } catch (error: any) {
      Alert.alert("Error", error.message)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

