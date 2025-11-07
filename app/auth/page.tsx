"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Initialize isLogin based on URL param directly on first render
  const initialMode = searchParams.get("mode") === "signup" ? false : true
  const [isLogin, setIsLogin] = useState(initialMode)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Use a ref to ensure the initial auth check runs only once on mount
  const initialAuthCheckDone = useRef(false)

  useEffect(() => {
    if (!initialAuthCheckDone.current) {
      initialAuthCheckDone.current = true // Mark as done

      const user = localStorage.getItem("vitalsync_user")
      if (user) {
        try {
          const userData = JSON.parse(user)
          if (userData.loggedIn && userData.userId) {
            router.push("/dashboard")
          }
        } catch (e) {
          console.error("Error parsing user data", e)
        }
      }
    }
  }, [router]) // Depend only on router for initial push

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.email) {
      newErrors.push("Email is required")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push("Email is invalid")
    }

    if (!formData.password) {
      newErrors.push("Password is required")
    } else if (formData.password.length < 6) {
      newErrors.push("Password must be at least 6 characters")
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.push("Name is required")
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.push("Passwords do not match")
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For login - check if user exists in registered users
      if (isLogin) {
        const registeredUsers = JSON.parse(localStorage.getItem("vitalsync_registered_users") || "{}")
        const existingUser = registeredUsers[formData.email]
        
        if (!existingUser) {
          setErrors(["No account found with this email. Please sign up first."])
          setIsLoading(false)
          return
        }
        
        if (existingUser.password !== formData.password) {
          setErrors(["Incorrect password. Please try again."])
          setIsLoading(false)
          return
        }
        
        // Login successful - use existing userId to preserve data
        const userData = {
          userId: existingUser.userId,
          email: formData.email,
          name: existingUser.name,
          loggedIn: true,
          loginDate: new Date().toISOString(),
        }
        
        localStorage.setItem("vitalsync_user", JSON.stringify(userData))
      } else {
        // For signup - create new user
        const registeredUsers = JSON.parse(localStorage.getItem("vitalsync_registered_users") || "{}")
        
        if (registeredUsers[formData.email]) {
          setErrors(["An account with this email already exists. Please login instead."])
          setIsLoading(false)
          return
        }
        
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Store in registered users database
        registeredUsers[formData.email] = {
          userId,
          email: formData.email,
          name: formData.name,
          password: formData.password,
          registeredDate: new Date().toISOString(),
        }
        localStorage.setItem("vitalsync_registered_users", JSON.stringify(registeredUsers))
        
        // Set current user
        const userData = {
          userId,
          email: formData.email,
          name: formData.name,
          loggedIn: true,
          loginDate: new Date().toISOString(),
        }
        localStorage.setItem("vitalsync_user", JSON.stringify(userData))
      }

      router.push("/dashboard")
    } catch (error) {
      setErrors(["Authentication failed. Please try again."])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center px-4 sm:px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-extrabold text-[#4ade80] flex items-center justify-center gap-3 no-underline mb-6"
          >
            <i className="fas fa-leaf"></i>
            VitalSync
          </Link>
          <h1 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-[#94a3b8]">
            {isLogin ? "Sign in to continue your journey" : "Start your fitness journey today"}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-300 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,222,128,0.4)] shadow-[0_10px_30px_rgba(74,222,128,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#94a3b8]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setFormData({ email: "", password: "", confirmPassword: "", name: "" })
                  setErrors([])
                }}
                className="text-[#4ade80] hover:text-[#22c55e] font-medium transition-colors bg-none border-none cursor-pointer"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
