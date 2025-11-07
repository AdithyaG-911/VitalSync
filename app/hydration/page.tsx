"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

export default function HydrationPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentIntake, setCurrentIntake] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(8)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [tempGoal, setTempGoal] = useState(8)
  const [hydrationHistory, setHydrationHistory] = useState<any[]>([])

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
      loadHydrationData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadHydrationData = (userId: string) => {
    const savedData = localStorage.getItem(`hydrationData_${userId}`)
    const today = new Date().toDateString()

    if (savedData) {
      const data = JSON.parse(savedData)

      // Check if data is from today
      if (data.date === today) {
        setCurrentIntake(data.currentIntake || 0)
        setDailyGoal(data.dailyGoal || 8)
        setHydrationHistory(data.history || [])
      } else {
        // New day, reset intake but keep goal and history
        setCurrentIntake(0)
        setDailyGoal(data.dailyGoal || 8)
        setHydrationHistory(data.history || [])

        // Save the reset data
        const newData = {
          date: today,
          currentIntake: 0,
          dailyGoal: data.dailyGoal || 8,
          history: data.history || [],
        }
        localStorage.setItem(`hydrationData_${userId}`, JSON.stringify(newData))
      }
    } else {
      // First time user
      const initialData = {
        date: today,
        currentIntake: 0,
        dailyGoal: 8,
        history: [],
      }
      localStorage.setItem(`hydrationData_${userId}`, JSON.stringify(initialData))
    }
  }

  const saveHydrationData = (intake: number, goal: number, history: any[]) => {
    if (currentUser?.userId) {
      const data = {
        date: new Date().toDateString(),
        currentIntake: intake,
        dailyGoal: goal,
        history: history,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(`hydrationData_${currentUser.userId}`, JSON.stringify(data))
    }
  }

  const addWater = (amount: number) => {
    const newIntake = currentIntake + amount
    const newHistory = [
      ...hydrationHistory,
      {
        amount,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
      },
    ]

    setCurrentIntake(newIntake)
    setHydrationHistory(newHistory)
    saveHydrationData(newIntake, dailyGoal, newHistory)

    // Check if goal is reached and trigger confetti
    if (currentIntake < dailyGoal && newIntake >= dailyGoal) {
      triggerConfetti()
    }
  }

  const removeWater = (amount: number) => {
    const newIntake = Math.max(0, currentIntake - amount)
    const newHistory = [
      ...hydrationHistory,
      {
        amount: -amount,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
      },
    ]

    setCurrentIntake(newIntake)
    setHydrationHistory(newHistory)
    saveHydrationData(newIntake, dailyGoal, newHistory)
  }

  const clearHistory = () => {
    setHydrationHistory([])
    saveHydrationData(currentIntake, dailyGoal, [])
  }

  const updateGoal = () => {
    setDailyGoal(tempGoal)
    saveHydrationData(currentIntake, tempGoal, hydrationHistory)
    setShowGoalModal(false)
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4ade80", "#22c55e", "#16a34a", "#15803d"],
    })
  }

  const getProgressPercentage = () => {
    return Math.min((currentIntake / dailyGoal) * 100, 100)
  }

  const getMotivationalMessage = () => {
    const percentage = getProgressPercentage()
    if (percentage >= 100) return "🎉 Goal achieved! Great job staying hydrated!"
    if (percentage >= 75) return "💪 Almost there! Keep it up!"
    if (percentage >= 50) return "👍 Halfway to your goal!"
    if (percentage >= 25) return "🌱 Good start! Keep drinking!"
    return "💧 Let's start hydrating!"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
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
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
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
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10 text-[#4ade80] bg-white/10"
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
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
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
                className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-3 rounded-lg transition-all"
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
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4ade80]">Daily Hydration</h2>
                <button
                  onClick={() => {
                    setTempGoal(dailyGoal)
                    setShowGoalModal(true)
                  }}
                  className="text-[#94a3b8] hover:text-white transition-colors"
                >
                  <i className="fas fa-cog"></i>
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl sm:text-5xl font-bold mb-2 text-[#4ade80]">
                  {currentIntake} / {dailyGoal}
                </div>
                <div className="text-[#94a3b8]">glasses of water</div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#94a3b8]">Progress</span>
                  <span className="text-sm text-[#94a3b8]">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${getProgressPercentage()}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-6 p-4 bg-white/5 rounded-lg">
                <p className="text-sm font-medium">{getMotivationalMessage()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addWater(1)}
                  className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,222,128,0.4)] shadow-[0_10px_30px_rgba(74,222,128,0.3)]"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Glass
                </button>
                <button
                  onClick={() => removeWater(1)}
                  disabled={currentIntake === 0}
                  className="bg-white/10 border border-white/20 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-minus mr-2"></i>
                  Remove Glass
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-4">Quick Add</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addWater(0.5)}
                  className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg font-medium transition-all hover:bg-white/20"
                >
                  +0.5 Glass
                </button>
                <button
                  onClick={() => addWater(2)}
                  className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg font-medium transition-all hover:bg-white/20"
                >
                  +2 Glasses
                </button>
                <button
                  onClick={() => addWater(3)}
                  className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg font-medium transition-all hover:bg-white/20"
                >
                  +3 Glasses
                </button>
                <button
                  onClick={() => addWater(4)}
                  className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg font-medium transition-all hover:bg-white/20"
                >
                  +4 Glasses
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Today's History</h3>
                {hydrationHistory.length > 0 && (
                  <button onClick={clearHistory} className="text-red-400 hover:text-red-300 transition-colors text-sm">
                    <i className="fas fa-trash mr-1"></i>
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {hydrationHistory.length > 0 ? (
                  hydrationHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`text-xl ${entry.amount > 0 ? "text-[#4ade80]" : "text-red-400"}`}>
                            <i className={`fas ${entry.amount > 0 ? "fa-plus" : "fa-minus"}`}></i>
                          </div>
                          <div>
                            <p className="font-medium">
                              {entry.amount > 0 ? "+" : ""}
                              {entry.amount} glass{Math.abs(entry.amount) !== 1 ? "es" : ""}
                            </p>
                            <p className="text-sm text-[#94a3b8]">{entry.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-[#94a3b8] text-center py-4">No water logged today yet!</p>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-4">Hydration Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Start Your Day</p>
                    <p className="text-[#94a3b8]">Drink a glass of water first thing in the morning.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Set Reminders</p>
                    <p className="text-[#94a3b8]">Use phone alarms to remind yourself to drink water regularly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-dumbbell"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Exercise Hydration</p>
                    <p className="text-[#94a3b8]">Drink extra water before, during, and after workouts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-thermometer-half"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Weather Awareness</p>
                    <p className="text-[#94a3b8]">Increase intake during hot weather or when you're sick.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Setting Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-5">
            <div className="bg-white/95 w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative text-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2d3748]">Set Daily Goal</h2>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="bg-none border-none text-2xl cursor-pointer text-[#a0aec0] transition-colors hover:text-[#e53e3e]"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Daily Water Goal (glasses)</label>
                <input
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 8 glasses per day</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={updateGoal}
                  className="flex-1 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white font-medium py-3 rounded-lg transition-all border-none cursor-pointer transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(74,222,128,0.3)]"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
