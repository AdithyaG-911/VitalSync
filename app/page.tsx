"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("vitalsync_user")
      if (user) {
        try {
          const userData = JSON.parse(user)
          if (userData.loggedIn && userData.userId) {
            router.push("/dashboard")
            return
          }
        } catch (e) {
          console.error("Error parsing user data", e)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignInClick = () => {
    router.push("/auth") // Directs to sign-in page
  }

  const handleSignUpClick = () => {
    router.push("/auth?mode=signup") // Directs to sign-up page
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
        <header className="flex justify-between items-center py-4 sm:py-5 mb-12 sm:mb-16">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] flex items-center gap-2 sm:gap-3">
            <i className="fas fa-leaf"></i>
            VitalSync
          </div>
          <Link
            href="/auth" // "Get Started" in header goes to sign-in
            className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,222,128,0.4)] shadow-[0_10px_30px_rgba(74,222,128,0.3)] no-underline"
          >
            Get Started
          </Link>
        </header>

        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text text-transparent">
            AI-Powered Health & Wellness Platform
          </h1>
          <p className="text-lg sm:text-xl text-[#94a3b8] mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            VitalSync is an advanced AI-driven platform that analyzes your blood test parameters, lifestyle data, 
            sleep patterns, nutrition, and activity levels to provide personalized health insights and recommendations.
          </p>
          <button
            onClick={handleSignInClick} // "Start Your Journey" goes to sign-in
            className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,222,128,0.4)] shadow-[0_10px_30px_rgba(74,222,128,0.3)] border-none cursor-pointer"
          >
            Start Your Journey
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-dumbbell"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Workout Tracking</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              30-day fitness challenge with daily workouts and progress tracking
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-utensils"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Diet Tracker</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Track your meals, calories, and macros with personalized nutrition goals
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-weight"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">BMI Calculator</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Monitor your body mass index with personalized health recommendations
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Health Checkup</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              AI-powered disease risk assessment based on your health metrics
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-tint"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Hydration Tracker</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Stay hydrated with daily water intake goals and progress monitoring
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-moon"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Sleep Analysis</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Track your sleep patterns and improve your rest quality
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-book-medical"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Nutrition Guide</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Comprehensive Indian food database with accurate macro values
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2">
            <div className="text-4xl sm:text-5xl mb-4 text-[#4ade80]">
              <i className="fas fa-vial"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Blood Test Analysis</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Unique AI-powered health insights from your blood test parameters
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Ready to Get Started?</h2>
          <p className="text-lg text-[#94a3b8] mb-8 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of users who have transformed their health with VitalSync. Start your journey today!
          </p>
          <button
            onClick={handleSignUpClick} // "Create Account" at bottom goes to sign-up
            className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,222,128,0.4)] shadow-[0_10px_30px_rgba(74,222,128,0.3)] border-none cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
