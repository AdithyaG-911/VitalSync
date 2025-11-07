"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MealEntry {
  id: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  foodName: string
  calories: number
  protein: number
  carbs: number
  fats: number
  timestamp: string
}

interface DietGoals {
  dailyCalories: number
  protein: number
  carbs: number
  fats: number
}

export default function DietPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([])
  const [dietGoals, setDietGoals] = useState<DietGoals>({
    dailyCalories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  })
  const [tempGoals, setTempGoals] = useState<DietGoals>(dietGoals)
  const [mealForm, setMealForm] = useState({
    mealType: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
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
      loadDietData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadDietData = (userId: string) => {
    const savedData = localStorage.getItem(`dietData_${userId}`)
    const today = new Date().toDateString()

    if (savedData) {
      const data = JSON.parse(savedData)
      
      if (data.goals) {
        setDietGoals(data.goals)
        setTempGoals(data.goals)
      }

      if (data.meals) {
        const todaysMeals = data.meals.filter((meal: MealEntry) => {
          const mealDate = new Date(meal.timestamp).toDateString()
          return mealDate === today
        })
        setTodayMeals(todaysMeals)
      }
    }
  }

  const saveDietData = (meals: MealEntry[], goals: DietGoals) => {
    if (currentUser?.userId) {
      const data = {
        meals,
        goals,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(`dietData_${currentUser.userId}`, JSON.stringify(data))
    }
  }

  const addMeal = () => {
    if (!mealForm.foodName || !mealForm.calories) return

    const newMeal: MealEntry = {
      id: `meal_${Date.now()}`,
      mealType: mealForm.mealType,
      foodName: mealForm.foodName,
      calories: Number(mealForm.calories),
      protein: Number(mealForm.protein) || 0,
      carbs: Number(mealForm.carbs) || 0,
      fats: Number(mealForm.fats) || 0,
      timestamp: new Date().toISOString(),
    }

    const updatedMeals = [...todayMeals, newMeal]
    setTodayMeals(updatedMeals)
    
    const allMeals = getAllMeals()
    allMeals.push(newMeal)
    saveDietData(allMeals, dietGoals)

    setMealForm({
      mealType: "breakfast",
      foodName: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    })
    setShowMealModal(false)
  }

  const getAllMeals = () => {
    const savedData = localStorage.getItem(`dietData_${currentUser?.userId}`)
    if (savedData) {
      const data = JSON.parse(savedData)
      return data.meals || []
    }
    return []
  }

  const deleteMeal = (mealId: string) => {
    const updatedTodayMeals = todayMeals.filter(m => m.id !== mealId)
    setTodayMeals(updatedTodayMeals)

    const allMeals = getAllMeals().filter((m: MealEntry) => m.id !== mealId)
    saveDietData(allMeals, dietGoals)
  }

  const updateGoals = () => {
    setDietGoals(tempGoals)
    const allMeals = getAllMeals()
    saveDietData(allMeals, tempGoals)
    setShowGoalsModal(false)
  }

  const getTotals = () => {
    return todayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }

  const totals = getTotals()

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getMealIcon = (mealType: string) => {
    const icons = {
      breakfast: "🍳",
      lunch: "🍱",
      dinner: "🍽️",
      snack: "🍎",
    }
    return icons[mealType] || "🍴"
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
            <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Dashboard</Link>
            <Link href="/workout" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Workouts</Link>
            <Link href="/bmi" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">BMI</Link>
            <Link href="/diet" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-2 rounded-lg">Diet</Link>
            <Link href="/hydration" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Hydration</Link>
            <Link href="/sleep" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Sleep</Link>
            <Link href="/health" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Health</Link>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10 transition-all">
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </header>

        {showMobileMenu && (
          <div className="md:hidden mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-home mr-2"></i> Dashboard</Link>
              <Link href="/workout" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-dumbbell mr-2"></i> Workouts</Link>
              <Link href="/bmi" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-weight mr-2"></i> BMI</Link>
              <Link href="/diet" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-utensils mr-2"></i> Diet</Link>
              <Link href="/hydration" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-tint mr-2"></i> Hydration</Link>
              <Link href="/sleep" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-moon mr-2"></i> Sleep</Link>
              <Link href="/health" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-heartbeat mr-2"></i> Health</Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4ade80]">Today's Nutrition</h2>
                <div className="flex gap-2">
                  <button onClick={() => { setTempGoals(dietGoals); setShowGoalsModal(true); }} className="text-[#94a3b8] hover:text-white p-2"><i className="fas fa-cog"></i></button>
                  <button onClick={() => setShowMealModal(true)} className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-4 py-2 rounded-lg"><i className="fas fa-plus mr-2"></i>Add</button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-[#94a3b8] mb-2">Calories</div>
                  <div className="text-2xl font-bold text-[#4ade80] mb-2">{totals.calories}</div>
                  <div className="text-xs text-[#94a3b8]">/ {dietGoals.dailyCalories} kcal</div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-2 rounded-full" style={{ width: `${getProgressPercentage(totals.calories, dietGoals.dailyCalories)}%` }} />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-[#94a3b8] mb-2">Protein</div>
                  <div className="text-2xl font-bold text-blue-400 mb-2">{totals.protein}g</div>
                  <div className="text-xs text-[#94a3b8]">/ {dietGoals.protein}g</div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${getProgressPercentage(totals.protein, dietGoals.protein)}%` }} />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-[#94a3b8] mb-2">Carbs</div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">{totals.carbs}g</div>
                  <div className="text-xs text-[#94a3b8]">/ {dietGoals.carbs}g</div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${getProgressPercentage(totals.carbs, dietGoals.carbs)}%` }} />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-[#94a3b8] mb-2">Fats</div>
                  <div className="text-2xl font-bold text-orange-400 mb-2">{totals.fats}g</div>
                  <div className="text-xs text-[#94a3b8]">/ {dietGoals.fats}g</div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${getProgressPercentage(totals.fats, dietGoals.fats)}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] p-4 rounded-xl text-center">
                <div className="text-sm font-medium mb-1">Remaining Calories</div>
                <div className="text-3xl font-bold">{Math.max(0, dietGoals.dailyCalories - totals.calories)} kcal</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-4">Today's Meals</h3>
              <div className="space-y-3">
                {todayMeals.length > 0 ? (
                  todayMeals.map((meal) => (
                    <div key={meal.id} className="flex justify-between items-start p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">{getMealIcon(meal.mealType)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold capitalize">{meal.mealType}</p>
                              <p className="text-sm text-[#94a3b8]">{meal.foodName}</p>
                            </div>
                            <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-300"><i className="fas fa-trash"></i></button>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="bg-white/5 rounded p-2"><div className="text-[#94a3b8]">Cal</div><div className="font-semibold text-[#4ade80]">{meal.calories}</div></div>
                            <div className="bg-white/5 rounded p-2"><div className="text-[#94a3b8]">Pro</div><div className="font-semibold text-blue-400">{meal.protein}g</div></div>
                            <div className="bg-white/5 rounded p-2"><div className="text-[#94a3b8]">Carbs</div><div className="font-semibold text-yellow-400">{meal.carbs}g</div></div>
                            <div className="bg-white/5 rounded p-2"><div className="text-[#94a3b8]">Fats</div><div className="font-semibold text-orange-400">{meal.fats}g</div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#94a3b8] text-center py-8">No meals logged today!</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Quick Add</h3>
              <div className="space-y-2">
                <button onClick={() => { setMealForm({ ...mealForm, mealType: "breakfast" }); setShowMealModal(true); }} className="w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-left flex items-center gap-3"><span className="text-2xl">🍳</span><span>Breakfast</span></button>
                <button onClick={() => { setMealForm({ ...mealForm, mealType: "lunch" }); setShowMealModal(true); }} className="w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-left flex items-center gap-3"><span className="text-2xl">🍱</span><span>Lunch</span></button>
                <button onClick={() => { setMealForm({ ...mealForm, mealType: "dinner" }); setShowMealModal(true); }} className="w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-left flex items-center gap-3"><span className="text-2xl">🍽️</span><span>Dinner</span></button>
                <button onClick={() => { setMealForm({ ...mealForm, mealType: "snack" }); setShowMealModal(true); }} className="w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-left flex items-center gap-3"><span className="text-2xl">🍎</span><span>Snack</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Modal */}
        {showMealModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white/95 w-full max-w-md rounded-2xl p-6 text-gray-800">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold">Add Meal</h2>
                <button onClick={() => setShowMealModal(false)} className="text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <select value={mealForm.mealType} onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value as any })} className="w-full px-4 py-3 border rounded-lg">
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
                <input type="text" value={mealForm.foodName} onChange={(e) => setMealForm({ ...mealForm, foodName: e.target.value })} placeholder="Food Name" className="w-full px-4 py-3 border rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} placeholder="Calories" className="px-4 py-3 border rounded-lg" />
                  <input type="number" value={mealForm.protein} onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })} placeholder="Protein (g)" className="px-4 py-3 border rounded-lg" />
                  <input type="number" value={mealForm.carbs} onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })} placeholder="Carbs (g)" className="px-4 py-3 border rounded-lg" />
                  <input type="number" value={mealForm.fats} onChange={(e) => setMealForm({ ...mealForm, fats: e.target.value })} placeholder="Fats (g)" className="px-4 py-3 border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowMealModal(false)} className="flex-1 bg-gray-200 py-3 rounded-lg">Cancel</button>
                <button onClick={addMeal} disabled={!mealForm.foodName || !mealForm.calories} className="flex-1 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 rounded-lg disabled:opacity-50">Add Meal</button>
              </div>
            </div>
          </div>
        )}

        {/* Goals Modal */}
        {showGoalsModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white/95 w-full max-w-md rounded-2xl p-6 text-gray-800">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold">Set Daily Goals</h2>
                <button onClick={() => setShowGoalsModal(false)} className="text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm mb-2">Daily Calories</label><input type="number" value={tempGoals.dailyCalories} onChange={(e) => setTempGoals({ ...tempGoals, dailyCalories: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" /></div>
                <div><label className="block text-sm mb-2">Protein (g)</label><input type="number" value={tempGoals.protein} onChange={(e) => setTempGoals({ ...tempGoals, protein: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" /></div>
                <div><label className="block text-sm mb-2">Carbs (g)</label><input type="number" value={tempGoals.carbs} onChange={(e) => setTempGoals({ ...tempGoals, carbs: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" /></div>
                <div><label className="block text-sm mb-2">Fats (g)</label><input type="number" value={tempGoals.fats} onChange={(e) => setTempGoals({ ...tempGoals, fats: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowGoalsModal(false)} className="flex-1 bg-gray-200 py-3 rounded-lg">Cancel</button>
                <button onClick={updateGoals} className="flex-1 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 rounded-lg">Save Goals</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
