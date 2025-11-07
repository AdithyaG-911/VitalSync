"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Exercise {
  name: string
  duration: string
  reps?: string
  instructions: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  muscleGroups?: string[]
}

interface WorkoutDay {
  day: number
  title: string
  type: string
  duration: string
  exercises: Exercise[]
  completed: boolean
  completedAt?: string
}

interface UserProfile {
  age: number
  gender: "male" | "female" | "other"
  fitnessLevel: "beginner" | "intermediate" | "advanced"
  goals: string[]
  healthConditions: string[]
  availableTime: number
}

interface WorkoutState {
  currentDay: number
  streak: number
  completedDays: number[]
  workoutHistory: WorkoutDay[]
  lastCompletionDate: string
  startDate: string
  userProfile?: UserProfile
}

// AI-driven workout plan generator
const generatePersonalizedPlan = (profile: UserProfile): Omit<WorkoutDay, "completed" | "completedAt">[] => {
  const { age, gender, fitnessLevel, goals, availableTime } = profile
  
  // Base exercises categorized by difficulty and focus
  const exerciseLibrary = {
    beginner: {
      warmup: [
        { name: "Gentle Walk", duration: "5 min", instructions: "Walk at comfortable pace", muscleGroups: ["legs", "cardio"] },
        { name: "Arm Circles", duration: "2 min", instructions: "Small circles, both directions", muscleGroups: ["shoulders"] },
        { name: "Neck Rolls", duration: "2 min", instructions: "Slow, controlled rotations", muscleGroups: ["neck"] }
      ],
      strength: [
        { name: "Wall Push-ups", duration: "2 sets", reps: "8-10 reps", instructions: "Hands on wall, push away", muscleGroups: ["chest", "arms"] },
        { name: "Chair Squats", duration: "2 sets", reps: "10-12 reps", instructions: "Squat to touch chair", muscleGroups: ["legs", "glutes"] },
        { name: "Standing Knee Lifts", duration: "2 sets", reps: "10 each", instructions: "Alternating knee raises", muscleGroups: ["core", "legs"] }
      ],
      cardio: [
        { name: "Marching in Place", duration: "3 min", instructions: "Lift knees high", muscleGroups: ["cardio", "legs"] },
        { name: "Step Touches", duration: "3 min", instructions: "Side to side steps", muscleGroups: ["cardio", "legs"] }
      ]
    },
    intermediate: {
      warmup: [
        { name: "Brisk Walk/Jog", duration: "5 min", instructions: "Moderate pace warm-up", muscleGroups: ["cardio"] },
        { name: "Dynamic Stretches", duration: "3 min", instructions: "Leg swings, arm rotations", muscleGroups: ["full body"] }
      ],
      strength: [
        { name: "Regular Push-ups", duration: "3 sets", reps: "10-15 reps", instructions: "Full push-ups", muscleGroups: ["chest", "arms", "core"] },
        { name: "Bodyweight Squats", duration: "3 sets", reps: "15-20 reps", instructions: "Deep squats", muscleGroups: ["legs", "glutes"] },
        { name: "Lunges", duration: "3 sets", reps: "10 each leg", instructions: "Alternating forward lunges", muscleGroups: ["legs", "glutes"] },
        { name: "Plank", duration: "3 sets", reps: "30-45 sec", instructions: "Hold plank position", muscleGroups: ["core"] }
      ],
      cardio: [
        { name: "Jumping Jacks", duration: "4 min", reps: "3 sets", instructions: "High intensity", muscleGroups: ["cardio", "full body"] },
        { name: "High Knees", duration: "3 min", instructions: "Run in place", muscleGroups: ["cardio", "legs"] }
      ]
    },
    advanced: {
      warmup: [
        { name: "Light Jog", duration: "5 min", instructions: "Get heart rate up", muscleGroups: ["cardio"] },
        { name: "Dynamic Warm-up", duration: "5 min", instructions: "Full body activation", muscleGroups: ["full body"] }
      ],
      strength: [
        { name: "Diamond Push-ups", duration: "4 sets", reps: "15-20 reps", instructions: "Hands close together", muscleGroups: ["chest", "triceps"] },
        { name: "Jump Squats", duration: "4 sets", reps: "15 reps", instructions: "Explosive jumps", muscleGroups: ["legs", "glutes", "power"] },
        { name: "Bulgarian Split Squats", duration: "3 sets", reps: "12 each", instructions: "Rear foot elevated", muscleGroups: ["legs", "glutes"] },
        { name: "Burpees", duration: "3 sets", reps: "10-15 reps", instructions: "Full body explosive", muscleGroups: ["full body", "cardio"] }
      ],
      cardio: [
        { name: "HIIT Intervals", duration: "5 min", instructions: "30s sprint, 30s rest", muscleGroups: ["cardio"] },
        { name: "Mountain Climbers", duration: "4 min", reps: "4 sets", instructions: "High intensity", muscleGroups: ["cardio", "core"] }
      ]
    }
  }

  const library = exerciseLibrary[fitnessLevel]
  const plan: Omit<WorkoutDay, "completed" | "completedAt">[] = []

  // Generate 30-day plan
  for (let day = 1; day <= 30; day++) {
    let exercises: Exercise[] = []
    let type = ""
    let title = ""

    if (day === 1) {
      title = `Welcome to Your Personalized ${fitnessLevel} Plan!`
      type = "Introduction"
      exercises = [...library.warmup, ...library.strength.slice(0, 2)]
    } else if (day % 7 === 0) {
      title = "Active Recovery"
      type = "Recovery"
      exercises = library.warmup
    } else if (day % 3 === 1) {
      title = "Strength Training"
      type = "Strength"
      exercises = [...library.warmup, ...library.strength]
    } else if (day % 3 === 2) {
      title = "Cardio Blast"
      type = "Cardio"
      exercises = [...library.warmup, ...library.cardio]
    } else {
      title = "Full Body Workout"
      type = "Full Body"
      exercises = [...library.warmup, ...library.strength.slice(0, 2), ...library.cardio.slice(0, 1)]
    }

    // Adjust duration based on available time
    const adjustedDuration = availableTime < 30 ? "15-20 min" : availableTime < 45 ? "25-35 min" : "35-45 min"

    plan.push({
      day,
      title,
      type,
      duration: adjustedDuration,
      exercises: exercises.map(ex => ({ ...ex, difficulty: fitnessLevel }))
    })
  }

  return plan
}

export default function WorkoutPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [workoutState, setWorkoutState] = useState<WorkoutState>({
    currentDay: 1,
    streak: 0,
    completedDays: [],
    workoutHistory: [],
    lastCompletionDate: "",
    startDate: new Date().toDateString(),
  })
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showExerciseDemo, setShowExerciseDemo] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseTimer, setExerciseTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [profileForm, setProfileForm] = useState<UserProfile>({
    age: 30,
    gender: "male",
    fitnessLevel: "beginner",
    goals: [],
    healthConditions: [],
    availableTime: 30,
  })
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationMessage, setGenerationMessage] = useState("")

  const [workoutPlan, setWorkoutPlan] = useState<Omit<WorkoutDay, "completed" | "completedAt">[]>([])

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
      loadWorkoutData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer(prev => prev - 1)
      }, 1000)
    } else if (exerciseTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      // Auto-advance to next exercise
      if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1)
      }
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, exerciseTimer, currentExerciseIndex, selectedWorkout])

  const loadWorkoutData = (userId: string) => {
    const savedState = localStorage.getItem(`fitTrackState_${userId}`)
    if (savedState) {
      const state = JSON.parse(savedState)
      
      // Check if user has profile
      if (state.userProfile) {
        const generatedPlan = generatePersonalizedPlan(state.userProfile)
        setWorkoutPlan(generatedPlan)
        setWorkoutState({
          ...state,
          workoutHistory: generatedPlan.map((workout, index) => ({
            ...workout,
            completed: state.completedDays?.includes(workout.day) || false,
            completedAt: state.workoutHistory?.[index]?.completedAt,
          })),
        })
        setProfileForm(state.userProfile)
      } else {
        // Show profile setup for first time users
        setShowProfileSetup(true)
      }
    } else {
      // First time user - show profile setup
      setShowProfileSetup(true)
    }
  }

  const saveWorkoutData = (userId: string, newState: WorkoutState) => {
    localStorage.setItem(`fitTrackState_${userId}`, JSON.stringify(newState))
  }

  const saveUserProfile = async () => {
    setIsGeneratingPlan(true)
    setGenerationProgress(0)
    
    const messages = [
      "🧠 AI is analyzing your profile...",
      "📊 Evaluating fitness level and goals...",
      "💪 Selecting optimal exercises...",
      "🎯 Customizing workout intensity...",
      "📅 Formulating 30-day plan...",
      "✨ Personalizing for your schedule...",
      "🎉 Finalizing your custom workout journey..."
    ]
    
    for (let i = 0; i < messages.length; i++) {
      setGenerationMessage(messages[i])
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationProgress(((i + 1) / messages.length) * 100)
    }
    
    const generatedPlan = generatePersonalizedPlan(profileForm)
    setWorkoutPlan(generatedPlan)
    
    const newState = {
      ...workoutState,
      userProfile: profileForm,
      workoutHistory: generatedPlan.map(workout => ({ ...workout, completed: false }))
    }
    
    setWorkoutState(newState)
    saveWorkoutData(currentUser.userId, newState)
    
    setIsGeneratingPlan(false)
    setShowProfileSetup(false)
  }

  const startExerciseDemo = (workout: WorkoutDay) => {
    // Check if workout is locked
    if (isWorkoutLocked(workout.day)) {
      return // Don't start if locked
    }
    
    setSelectedWorkout(workout)
    setCurrentExerciseIndex(0)
    setShowExerciseDemo(true)
    setExerciseTimer(0)
    setIsTimerRunning(false)
  }

  const startTimer = (seconds: number) => {
    setExerciseTimer(seconds)
    setIsTimerRunning(true)
  }

  // Check if a workout is locked based on completion times
  const isWorkoutLocked = (dayNumber: number): boolean => {
    // Day 1 is never locked
    if (dayNumber === 1) return false
    
    // If this day is already completed, it's not locked (can review)
    if (workoutState.completedDays.includes(dayNumber)) return false
    
    // Check if previous day is completed
    const previousDay = dayNumber - 1
    if (!workoutState.completedDays.includes(previousDay)) {
      // Previous day not completed - this workout is locked
      return true
    }
    
    // Previous day is completed - check if 24 hours have passed since midnight
    const previousWorkout = workoutState.workoutHistory.find(w => w.day === previousDay)
    if (!previousWorkout?.completedAt) return true
    
    const completedDate = new Date(previousWorkout.completedAt)
    const completedDateMidnight = new Date(completedDate)
    completedDateMidnight.setHours(0, 0, 0, 0)
    
    const now = new Date()
    const todayMidnight = new Date()
    todayMidnight.setHours(0, 0, 0, 0)
    
    // Check if today's midnight is after the completion date's midnight
    // This ensures we've passed at least one midnight (new day)
    return todayMidnight <= completedDateMidnight
  }

  // Get time until unlock for locked workouts
  const getTimeUntilUnlock = (dayNumber: number): string => {
    const previousDay = dayNumber - 1
    const previousWorkout = workoutState.workoutHistory.find(w => w.day === previousDay)
    
    if (!previousWorkout?.completedAt) return "Complete previous workout first"
    
    const completedDate = new Date(previousWorkout.completedAt)
    const nextMidnight = new Date(completedDate)
    nextMidnight.setDate(nextMidnight.getDate() + 1)
    nextMidnight.setHours(0, 0, 0, 0)
    
    const now = new Date()
    const timeDiff = nextMidnight.getTime() - now.getTime()
    
    if (timeDiff <= 0) return "Unlocked"
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `Unlocks in ${hours}h ${minutes}m`
  }

  const completeWorkout = (dayNumber: number) => {
    const newState = { ...workoutState }

    if (!newState.completedDays.includes(dayNumber)) {
      newState.completedDays.push(dayNumber)
      newState.streak = calculateStreak(newState.completedDays)
      newState.lastCompletionDate = new Date().toDateString()

      const workoutIndex = newState.workoutHistory.findIndex(w => w.day === dayNumber)
      if (workoutIndex !== -1) {
        newState.workoutHistory[workoutIndex].completed = true
        newState.workoutHistory[workoutIndex].completedAt = new Date().toISOString()
      }

      // Update current day to next uncompleted day
      if (dayNumber === newState.currentDay && newState.currentDay < 30) {
        // Find next incomplete day
        let nextDay = dayNumber + 1
        while (nextDay <= 30 && newState.completedDays.includes(nextDay)) {
          nextDay++
        }
        newState.currentDay = nextDay <= 30 ? nextDay : 30
      }

      // Trigger confetti
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    }

    setWorkoutState(newState)
    saveWorkoutData(currentUser.userId, newState)
    setShowExerciseDemo(false)
  }

  const calculateStreak = (completedDays: number[]) => {
    if (completedDays.length === 0) return 0
    const sortedDays = [...completedDays].sort((a, b) => b - a)
    let streak = 1
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i - 1] - sortedDays[i] === 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (level?: string) => {
    switch(level) {
      case "beginner": return "text-green-400"
      case "intermediate": return "text-yellow-400"
      case "advanced": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  const currentExercise = selectedWorkout?.exercises[currentExerciseIndex]

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
        {/* Header */}
        <header className="flex justify-between items-center py-4 sm:py-5 mb-6 sm:mb-8 border-b border-white/10">
          <Link href="/" className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] flex items-center gap-2 sm:gap-3 no-underline">
            <i className="fas fa-leaf"></i>
            VitalSync
          </Link>

          <div className="hidden md:flex gap-5">
            <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Dashboard</Link>
            <Link href="/workout" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-2 rounded-lg">Workouts</Link>
            <Link href="/bmi" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">BMI</Link>
            <Link href="/diet" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Diet</Link>
            <Link href="/hydration" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Hydration</Link>
            <Link href="/sleep" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Sleep</Link>
            <Link href="/health" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Health</Link>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10">
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </header>

        {/* AI Banner */}
        <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-brain text-2xl text-purple-400"></i>
            <h3 className="text-xl font-bold">AI-Powered Personalization</h3>
          </div>
          <p className="text-sm text-[#94a3b8]">
            Your workout plan is dynamically generated using AI based on your age, gender, fitness level, and health data. 
            VitalSync analyzes your activity patterns, blood test parameters, and lifestyle to create the perfect fitness journey for you.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[#4ade80] text-3xl mb-2"><i className="fas fa-fire"></i></div>
            <div className="text-2xl font-bold">{workoutState.streak}</div>
            <div className="text-sm text-[#94a3b8]">Day Streak</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[#4ade80] text-3xl mb-2"><i className="fas fa-check-circle"></i></div>
            <div className="text-2xl font-bold">{workoutState.completedDays.length}/30</div>
            <div className="text-sm text-[#94a3b8]">Completed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[#4ade80] text-3xl mb-2"><i className="fas fa-user-shield"></i></div>
            <div className="text-lg font-bold capitalize">{workoutState.userProfile?.fitnessLevel || "N/A"}</div>
            <div className="text-sm text-[#94a3b8]">Your Level</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[#4ade80] text-3xl mb-2"><i className="fas fa-clock"></i></div>
            <div className="text-lg font-bold">{workoutState.userProfile?.availableTime || 0} min</div>
            <div className="text-sm text-[#94a3b8]">Daily Time</div>
          </div>
        </div>

        {/* Today's Workout */}
        {workoutPlan.length > 0 && (
          <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] p-6 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold mb-3">Today's Challenge - Day {workoutState.currentDay}</h2>
            <p className="text-lg mb-4">{workoutPlan[workoutState.currentDay - 1]?.title}</p>
            {isWorkoutLocked(workoutState.currentDay) ? (
              <div className="bg-white/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fas fa-lock text-2xl"></i>
                  <p className="font-semibold">Workout Locked</p>
                </div>
                <p className="text-sm">{getTimeUntilUnlock(workoutState.currentDay)}</p>
                <p className="text-xs mt-2 opacity-80">Complete your previous workout and wait until midnight to unlock this session.</p>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => startExerciseDemo(workoutPlan[workoutState.currentDay - 1] as WorkoutDay)}
                  className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
                >
                  <i className="fas fa-play"></i>
                  Start Workout
                </button>
                <button
                  onClick={() => setShowProfileSetup(true)}
                  className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
                >
                  <i className="fas fa-cog"></i>
                  Update Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Workout Calendar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-2xl font-bold mb-6">30-Day Plan</h3>
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
            <i className="fas fa-info-circle mr-2"></i>
            <span className="font-semibold">Daily Unlock System:</span> Complete one workout per day. Next workout unlocks at midnight (12 AM).
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-3">
            {workoutPlan.map((workout) => {
              const isLocked = isWorkoutLocked(workout.day)
              const isCompleted = workoutState.completedDays.includes(workout.day)
              const isCurrent = workout.day === workoutState.currentDay
              
              return (
                <div key={workout.day} className="relative">
                  <button
                    onClick={() => !isLocked && startExerciseDemo(workout as WorkoutDay)}
                    disabled={isLocked}
                    className={`w-full p-4 rounded-xl transition-all relative ${
                      isCompleted
                        ? "bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-white"
                        : isCurrent && !isLocked
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse"
                        : isLocked
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-60"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <div className="text-2xl font-bold mb-1">{workout.day}</div>
                    {isCompleted && (
                      <i className="fas fa-check text-sm"></i>
                    )}
                    {isLocked && !isCompleted && (
                      <i className="fas fa-lock text-sm"></i>
                    )}
                  </button>
                  {isLocked && !isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      <i className="fas fa-lock text-xs"></i>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center">
                <i className="fas fa-check text-xs"></i>
              </div>
              <span className="text-[#94a3b8]">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse"></div>
              <span className="text-[#94a3b8]">Available Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-700/50 flex items-center justify-center">
                <i className="fas fa-lock text-xs text-gray-500"></i>
              </div>
              <span className="text-[#94a3b8]">Locked (wait for midnight)</span>
            </div>
          </div>
        </div>

        {/* Profile Setup Modal */}
        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white/95 text-gray-800 rounded-2xl p-8 max-w-2xl w-full my-8">
              {!isGeneratingPlan ? (
                <>
                  <h2 className="text-3xl font-bold mb-6 text-center">Create Your Personalized Workout Plan</h2>
                  <p className="text-center mb-6 text-gray-600">
                    Our AI will analyze your profile to create a customized 30-day fitness journey
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Age</label>
                        <input
                          type="number"
                          value={profileForm.age}
                          onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                          className="w-full px-4 py-3 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <select
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as any })}
                          className="w-full px-4 py-3 border rounded-lg"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Fitness Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["beginner", "intermediate", "advanced"].map(level => (
                          <button
                            key={level}
                            onClick={() => setProfileForm({ ...profileForm, fitnessLevel: level as any })}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              profileForm.fitnessLevel === level
                                ? "border-[#4ade80] bg-[#4ade80]/10"
                                : "border-gray-300 hover:border-[#4ade80]/50"
                            }`}
                          >
                            <div className="font-semibold capitalize">{level}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Available Time (minutes/day)</label>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="5"
                        value={profileForm.availableTime}
                        onChange={(e) => setProfileForm({ ...profileForm, availableTime: Number(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center font-bold text-2xl mt-2">{profileForm.availableTime} min</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Fitness Goals (select all that apply)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "General Health"].map(goal => (
                          <label key={goal} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={profileForm.goals.includes(goal)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileForm({ ...profileForm, goals: [...profileForm.goals, goal] })
                                } else {
                                  setProfileForm({ ...profileForm, goals: profileForm.goals.filter(g => g !== goal) })
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span>{goal}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Health Conditions (optional)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Joint Issues", "Back Pain", "Heart Condition", "Diabetes"].map(condition => (
                          <label key={condition} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={profileForm.healthConditions.includes(condition)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileForm({ ...profileForm, healthConditions: [...profileForm.healthConditions, condition] })
                                } else {
                                  setProfileForm({ ...profileForm, healthConditions: profileForm.healthConditions.filter(c => c !== condition) })
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span>{condition}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={saveUserProfile}
                      className="w-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
                    >
                      Generate My Personalized Plan
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12">
                  <div className="text-center mb-8">
                    <div className="animate-spin text-6xl mb-4">🤖</div>
                    <h3 className="text-2xl font-bold mb-2">AI Generating Your Custom Plan...</h3>
                    <p className="text-gray-600 mb-6">{generationMessage}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-4 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">{Math.round(generationProgress)}% Complete</p>
                  <div className="mt-6 text-center text-xs text-gray-500">
                    <i className="fas fa-brain mr-2"></i>
                    Powered by VitalSync AI Engine
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exercise Demo Modal */}
        {showExerciseDemo && selectedWorkout && currentExercise && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 text-gray-800 rounded-2xl p-8 max-w-4xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Day {selectedWorkout.day}: {selectedWorkout.title}</h2>
                <button onClick={() => setShowExerciseDemo(false)} className="text-3xl hover:text-red-500">×</button>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Exercise {currentExerciseIndex + 1} of {selectedWorkout.exercises.length}</span>
                  <span className={getDifficultyColor(currentExercise.difficulty)}>{currentExercise.difficulty}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-3 rounded-full transition-all"
                    style={{ width: `${((currentExerciseIndex + 1) / selectedWorkout.exercises.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Exercise Card */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 mb-6">
                <h3 className="text-4xl font-bold mb-4 text-center">{currentExercise.name}</h3>
                
                {/* Enhanced Animated Human Icon with Exercise Visual */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Animated Background Pulse */}
                    <div className="absolute inset-0 bg-[#4ade80]/20 rounded-full animate-ping"></div>
                    
                    {/* Main Exercise Icon */}
                    <div className="relative w-40 h-40 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                      {/* Human Exercise Figure */}
                      <div className="text-white text-center">
                        {/* Dynamic icon based on exercise type */}
                        {currentExercise.name.toLowerCase().includes('push') && (
                          <div className="text-7xl">🧍</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('squat') && (
                          <div className="text-7xl">🧎</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('run') && (
                          <div className="text-7xl">🏃</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('walk') && (
                          <div className="text-7xl">🚶</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('plank') && (
                          <div className="text-7xl">🧘</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('lunge') && (
                          <div className="text-7xl">🧑‍🦱</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('jump') && (
                          <div className="text-7xl">🤸</div>
                        )}
                        {currentExercise.name.toLowerCase().includes('stretch') && (
                          <div className="text-7xl">🧘‍♂️</div>
                        )}
                        {!currentExercise.name.toLowerCase().match(/push|squat|run|walk|plank|lunge|jump|stretch/) && (
                          <div className="text-7xl">💪</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Animated Ring Around Icon */}
                    <div className="absolute -inset-2 border-4 border-[#4ade80]/30 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-[#4ade80]">{currentExercise.duration}</div>
                    <div className="text-sm">Duration</div>
                  </div>
                  {currentExercise.reps && (
                    <div className="bg-white/50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{currentExercise.reps}</div>
                      <div className="text-sm">Repetitions</div>
                    </div>
                  )}
                </div>

                <div className="bg-white/70 p-6 rounded-lg mb-6">
                  <h4 className="font-bold mb-2">Instructions:</h4>
                  <p className="leading-relaxed">{currentExercise.instructions}</p>
                </div>

                {currentExercise.muscleGroups && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentExercise.muscleGroups.map(muscle => (
                      <span key={muscle} className="bg-white/60 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {muscle}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timer */}
                {isTimerRunning && (
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-[#4ade80] mb-2">{formatTime(exerciseTimer)}</div>
                    <div className="text-sm text-gray-600">Time Remaining</div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                  {!isTimerRunning && (
                    <button
                      onClick={() => startTimer(60)}
                      className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg"
                    >
                      <i className="fas fa-play mr-2"></i>
                      Start 60s Timer
                    </button>
                  )}
                  
                  {currentExerciseIndex < selectedWorkout.exercises.length - 1 && (
                    <button
                      onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                      className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-600"
                    >
                      Next Exercise <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  )}

                  {currentExerciseIndex === selectedWorkout.exercises.length - 1 && (
                    <button
                      onClick={() => completeWorkout(selectedWorkout.day)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Complete Workout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
