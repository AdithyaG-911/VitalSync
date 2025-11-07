"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    dayStreak: 0,
    workoutsCompleted: 0,
    waterToday: 0,
    avgSleep: "0h 0m",
    caloriesConsumed: 0,
    healthRisk: "N/A",
    nutritionMealsToday: 0,
    bloodTestStatus: "Not Tested",
  })

  useEffect(() => {
    const user = localStorage.getItem("vitalsync_user")
    if (!user) {
      router.push("/auth")
      return
    }

    try {
      const userData = JSON.parse(user)
      if (!userData.loggedIn || !userData.userId) {
        router.push("/auth")
        return
      }

      setCurrentUser(userData)
      loadDashboardStats(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadDashboardStats = (userId: string) => {
    // Load workout data
    const workoutData = localStorage.getItem(`fitTrackState_${userId}`)
    let workoutStats = { streak: 0, completedDays: [] }
    if (workoutData) {
      const data = JSON.parse(workoutData)
      workoutStats = {
        streak: data.streak || 0,
        completedDays: data.completedDays || [],
      }
    }

    // Load hydration data
    const hydrationData = localStorage.getItem(`hydrationData_${userId}`)
    let waterToday = 0
    if (hydrationData) {
      const data = JSON.parse(hydrationData)
      const today = new Date().toDateString()
      if (data.date === today) {
        waterToday = data.currentIntake || 0
      }
    }

    // Load sleep data
    const sleepData = localStorage.getItem(`sleepData_${userId}`)
    let avgSleep = "0h 0m"
    if (sleepData) {
      const data = JSON.parse(sleepData)
      if (data.sleepRecords && data.sleepRecords.length > 0) {
        const totalSleep = data.sleepRecords.reduce((sum: number, record: any) => sum + (record.duration || 0), 0)
        const avgHours = totalSleep / data.sleepRecords.length
        const hours = Math.floor(avgHours)
        const minutes = Math.round((avgHours - hours) * 60)
        avgSleep = `${hours}h ${minutes}m`
      }
    }

    // Load diet data
    const dietData = localStorage.getItem(`dietData_${userId}`)
    let caloriesConsumed = 0
    if (dietData) {
      const data = JSON.parse(dietData)
      const today = new Date().toDateString()
      if (data.meals) {
        const todaysMeals = data.meals.filter((meal: any) => {
          const mealDate = new Date(meal.timestamp).toDateString()
          return mealDate === today
        })
        caloriesConsumed = todaysMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0)
      }
    }

    // Load health data
    const healthData = localStorage.getItem(`healthData_${userId}`)
    let healthRisk = "N/A"
    if (healthData) {
      const data = JSON.parse(healthData)
      if (data.riskAssessment) {
        healthRisk = data.riskAssessment.overallRisk || "N/A"
      }
    }

    // Load nutrition plan data
    const nutritionData = localStorage.getItem(`nutritionPlan_${userId}`)
    let nutritionMealsToday = 0
    if (nutritionData) {
      const data = JSON.parse(nutritionData)
      const today = new Date().toDateString()
      if (data.date === today && data.meals) {
        nutritionMealsToday = data.meals.length
      }
    }

    // Load blood test data
    const bloodTestData = localStorage.getItem(`bloodTest_${userId}`)
    let bloodTestStatus = "Not Tested"
    if (bloodTestData) {
      const data = JSON.parse(bloodTestData)
      if (data.bloodTest) {
        bloodTestStatus = "Analyzed"
      }
    }

    setDashboardStats({
      dayStreak: workoutStats.streak,
      workoutsCompleted: workoutStats.completedDays.length,
      waterToday: waterToday,
      avgSleep: avgSleep,
      caloriesConsumed: caloriesConsumed,
      healthRisk: healthRisk,
      nutritionMealsToday: nutritionMealsToday,
      bloodTestStatus: bloodTestStatus,
    })
  }

  const handleLogout = () => {
    // Only remove the current session, keep all user data intact
    localStorage.removeItem("vitalsync_user")
    router.push("/")
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
        <header className="flex justify-between items-center py-4 sm:py-5 mb-6 sm:mb-8 border-b border-white/10">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] flex items-center gap-2 sm:gap-3 no-underline"
          >
            <i className="fas fa-leaf"></i>
            VitalSync
          </Link>

          <div className="hidden md:flex gap-5">
            <Link
              href="/dashboard"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10 text-[#4ade80] bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/workout"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Workouts
            </Link>
            <Link
              href="/bmi"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              BMI
            </Link>
            <Link
              href="/diet"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Diet
            </Link>
            <Link
              href="/hydration"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Hydration
            </Link>
            <Link
              href="/sleep"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Sleep
            </Link>
            <Link
              href="/health"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Health
            </Link>
            <Link
              href="/nutrition"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Nutrition
            </Link>
            <Link
              href="/blood-test"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Blood Test
            </Link>
            <button
              onClick={handleLogout}
              className="text-[#94a3b8] font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10 bg-none border-none cursor-pointer"
            >
              Logout
            </button>
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </header>

        {showMobileMenu && (
          <div className="md:hidden mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-3 rounded-lg transition-all"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-home mr-2"></i> Dashboard
              </Link>
              <Link
                href="/workout"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-dumbbell mr-2"></i> Workouts
              </Link>
              <Link
                href="/bmi"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-weight mr-2"></i> BMI
              </Link>
              <Link
                href="/diet"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-utensils mr-2"></i> Diet
              </Link>
              <Link
                href="/hydration"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-tint mr-2"></i> Hydration
              </Link>
              <Link
                href="/sleep"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-moon mr-2"></i> Sleep
              </Link>
              <Link
                href="/health"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-heartbeat mr-2"></i> Health
              </Link>
              <Link
                href="/nutrition"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-book-medical mr-2"></i> Nutrition
              </Link>
              <Link
                href="/blood-test"
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-vial mr-2"></i> Blood Test
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
                className="text-[#94a3b8] font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10 text-left bg-none border-none cursor-pointer"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome back, {currentUser.name}!</h1>
          <p className="text-[#94a3b8] text-lg">Here's your AI-powered health overview for today</p>
        </div>

        {/* AI Insights Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl"><i className="fas fa-brain text-purple-400"></i></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span>AI Health Insights</span>
                <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">Powered by VitalSync AI</span>
              </h3>
              <p className="text-sm text-[#94a3b8] mb-3">
                VitalSync analyzes your blood test parameters, lifestyle data, sleep patterns, nutrition, and activity levels 
                to provide personalized health recommendations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-chart-line text-green-400"></i>
                    <span className="font-semibold">Activity Trend</span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {dashboardStats.workoutsCompleted > 5 ? "Great consistency! Your workout streak is building momentum." : "Start small - consistency beats intensity. Try completing 3 workouts this week."}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-heartbeat text-red-400"></i>
                    <span className="font-semibold">Health Status</span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {dashboardStats.healthRisk === "Low" ? "Your health metrics are optimal! Keep up the great work." : 
                     dashboardStats.healthRisk === "Moderate" ? "Some areas need attention. Review your health checkup for details." :
                     dashboardStats.healthRisk === "High" || dashboardStats.healthRisk === "Very High" ? "Important: Consult with your healthcare provider about your risk factors." :
                     "Complete your health checkup to get personalized AI insights."}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-utensils text-yellow-400"></i>
                    <span className="font-semibold">Nutrition Analysis</span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {dashboardStats.caloriesConsumed > 0 ? `You've consumed ${dashboardStats.caloriesConsumed} calories today. ` : "Start tracking your meals to get AI-powered nutrition insights. "}
                    {dashboardStats.caloriesConsumed > 2500 ? "Consider lighter meals for dinner." : dashboardStats.caloriesConsumed > 0 ? "Good balance so far!" : ""}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-moon text-blue-400"></i>
                    <span className="font-semibold">Recovery Metric</span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {dashboardStats.avgSleep !== "0h 0m" ? `Average sleep: ${dashboardStats.avgSleep}. ` : "Track your sleep to optimize recovery. "}
                    {dashboardStats.avgSleep !== "0h 0m" && dashboardStats.avgSleep < "7h" ? "Aim for 7-9 hours for optimal recovery." : "Great sleep habits support your fitness goals!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-fire"></i>
              </div>
              <span className="text-2xl font-bold">{dashboardStats.dayStreak}</span>
            </div>
            <h3 className="font-semibold mb-1">Day Streak</h3>
            <p className="text-[#94a3b8] text-sm">Consecutive workout days</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-dumbbell"></i>
              </div>
              <span className="text-2xl font-bold">{dashboardStats.workoutsCompleted}</span>
            </div>
            <h3 className="font-semibold mb-1">Workouts Completed</h3>
            <p className="text-[#94a3b8] text-sm">Total workouts finished</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-utensils"></i>
              </div>
              <span className="text-2xl font-bold">{dashboardStats.caloriesConsumed}</span>
            </div>
            <h3 className="font-semibold mb-1">Calories Today</h3>
            <p className="text-[#94a3b8] text-sm">Consumed today</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-tint"></i>
              </div>
              <span className="text-2xl font-bold">{dashboardStats.waterToday}</span>
            </div>
            <h3 className="font-semibold mb-1">Water Today</h3>
            <p className="text-[#94a3b8] text-sm">Glasses consumed</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-moon"></i>
              </div>
              <span className="text-2xl font-bold">{dashboardStats.avgSleep}</span>
            </div>
            <h3 className="font-semibold mb-1">Avg Sleep</h3>
            <p className="text-[#94a3b8] text-sm">Average sleep duration</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-heartbeat"></i>
              </div>
              <span className={`text-2xl font-bold ${dashboardStats.healthRisk === 'Low' ? 'text-[#4ade80]' : dashboardStats.healthRisk === 'Moderate' ? 'text-yellow-400' : dashboardStats.healthRisk === 'High' || dashboardStats.healthRisk === 'Very High' ? 'text-red-400' : 'text-gray-400'}`}>
                {dashboardStats.healthRisk}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Health Risk</h3>
            <p className="text-[#94a3b8] text-sm">Overall assessment</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-book-medical"></i>
              </div>
              <span className="text-2xl font-bold">{dashboardStats.nutritionMealsToday}</span>
            </div>
            <h3 className="font-semibold mb-1">Nutrition Meals</h3>
            <p className="text-[#94a3b8] text-sm">Logged today</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#4ade80] text-2xl">
                <i className="fas fa-vial"></i>
              </div>
              <span className={`text-lg font-bold ${dashboardStats.bloodTestStatus === 'Analyzed' ? 'text-[#4ade80]' : 'text-gray-400'}`}>
                {dashboardStats.bloodTestStatus}
              </span>
            </div>
            <h3 className="font-semibold mb-1">Blood Test</h3>
            <p className="text-[#94a3b8] text-sm">Analysis status</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#4ade80]">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/workout"
              className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,222,128,0.4)] shadow-[0_10px_30px_rgba(74,222,128,0.3)] no-underline text-center"
            >
              <i className="fas fa-dumbbell text-2xl mb-2 block"></i>
              Start Workout
            </Link>
            <Link
              href="/diet"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-utensils text-2xl mb-2 block text-[#4ade80]"></i>
              Log Meal
            </Link>
            <Link
              href="/nutrition"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-book-medical text-2xl mb-2 block text-[#4ade80]"></i>
              Nutrition Guide
            </Link>
            <Link
              href="/hydration"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-tint text-2xl mb-2 block text-[#4ade80]"></i>
              Log Water
            </Link>
            <Link
              href="/bmi"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-weight text-2xl mb-2 block text-[#4ade80]"></i>
              Check BMI
            </Link>
            <Link
              href="/sleep"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-moon text-2xl mb-2 block text-[#4ade80]"></i>
              Log Sleep
            </Link>
            <Link
              href="/health"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-heartbeat text-2xl mb-2 block text-[#4ade80]"></i>
              Health Check
            </Link>
            <Link
              href="/blood-test"
              className="bg-white/10 border border-white/20 text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:transform hover:-translate-y-1 no-underline text-center"
            >
              <i className="fas fa-vial text-2xl mb-2 block text-[#4ade80]"></i>
              Blood Test
            </Link>
          </div>
        </div>

        {/* AI-Powered Recommendations */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <i className="fas fa-robot text-3xl text-purple-400"></i>
            <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💪</div>
                <div>
                  <h4 className="font-bold mb-2">Workout Optimization</h4>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    {dashboardStats.dayStreak > 0 
                      ? `Excellent ${dashboardStats.dayStreak}-day streak! Your consistency is paying off. Consider adding 5 more minutes to your next session.`
                      : "Start building momentum with just 15 minutes today. The AI has created a personalized beginner plan for you."}
                  </p>
                  <Link href="/workout" className="text-[#4ade80] text-sm font-semibold hover:underline no-underline">View Plan →</Link>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🥗</div>
                <div>
                  <h4 className="font-bold mb-2">Nutrition Balance</h4>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    {dashboardStats.caloriesConsumed > 0
                      ? `Based on your ${dashboardStats.caloriesConsumed} calories consumed, aim for protein-rich dinner to support muscle recovery.`
                      : "Track your first meal to receive personalized macro recommendations from our AI nutrition analyzer."}
                  </p>
                  <Link href="/diet" className="text-[#4ade80] text-sm font-semibold hover:underline no-underline">Track Nutrition →</Link>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">❤️</div>
                <div>
                  <h4 className="font-bold mb-2">Health Monitoring</h4>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    {dashboardStats.healthRisk !== "N/A"
                      ? `Your health risk is ${dashboardStats.healthRisk.toLowerCase()}. ${dashboardStats.healthRisk === "Low" ? "Keep maintaining your healthy lifestyle!" : "Review detailed recommendations in your health report."}`
                      : "Complete your health checkup to enable AI risk assessment based on blood test parameters and lifestyle data."}
                  </p>
                  <Link href="/health" className="text-[#4ade80] text-sm font-semibold hover:underline no-underline">Health Check →</Link>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">😴</div>
                <div>
                  <h4 className="font-bold mb-2">Recovery Score</h4>
                  <p className="text-sm text-[#94a3b8] mb-3">
                    {dashboardStats.avgSleep !== "0h 0m"
                      ? `Your average sleep of ${dashboardStats.avgSleep} helps with recovery. Hydration level: ${dashboardStats.waterToday}/8 glasses.`
                      : "Track sleep and hydration to get AI-powered recovery insights that optimize your performance."}
                  </p>
                  <Link href="/sleep" className="text-[#4ade80] text-sm font-semibold hover:underline no-underline">Track Sleep →</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm text-center text-[#94a3b8]">
              <i className="fas fa-info-circle mr-2"></i>
              VitalSync AI continuously learns from your patterns to provide increasingly personalized recommendations. 
              The more data you log, the smarter your insights become!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
