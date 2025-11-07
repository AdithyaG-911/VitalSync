"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FoodItem {
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  category: "veg" | "non-veg" | "dairy" | "grains" | "fruits" | "nuts" | "oils"
  isIndian: boolean
}

const INDIAN_FOOD_DATABASE: FoodItem[] = [
  // Non-Vegetarian
  { name: "Chicken Breast (cooked)", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, category: "non-veg", isIndian: true },
  { name: "Egg (whole, cooked)", calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0, category: "non-veg", isIndian: true },
  
  // Dairy
  { name: "Milk (cow, whole)", calories: 60, protein: 3.2, fat: 3.3, carbs: 4.8, fiber: 0, category: "dairy", isIndian: true },
  { name: "Paneer", calories: 296, protein: 18, fat: 22, carbs: 2, fiber: 0, category: "dairy", isIndian: true },
  { name: "Curd (dahi)", calories: 98, protein: 3.5, fat: 4, carbs: 11, fiber: 0, category: "dairy", isIndian: true },
  
  // Grains & Cereals
  { name: "Rice (white, cooked)", calories: 130, protein: 2.4, fat: 0.3, carbs: 28, fiber: 0.4, category: "grains", isIndian: true },
  { name: "Rice (brown, cooked)", calories: 111, protein: 2.6, fat: 0.9, carbs: 23, fiber: 1.8, category: "grains", isIndian: true },
  { name: "Wheat Roti (chapati)", calories: 120, protein: 3.1, fat: 3.7, carbs: 18, fiber: 2, category: "grains", isIndian: true },
  { name: "Oats (cooked)", calories: 71, protein: 2.5, fat: 1.5, carbs: 12, fiber: 1.7, category: "grains", isIndian: true },
  
  // Dals & Legumes
  { name: "Dal (cooked)", calories: 120, protein: 9, fat: 0.4, carbs: 20, fiber: 8, category: "veg", isIndian: true },
  { name: "Toor Dal (cooked)", calories: 140, protein: 8.5, fat: 3, carbs: 18, fiber: 7, category: "veg", isIndian: true },
  { name: "Moong Dal (cooked)", calories: 105, protein: 8, fat: 1, carbs: 19, fiber: 7, category: "veg", isIndian: true },
  { name: "Chana Dal (cooked)", calories: 160, protein: 9, fat: 4, carbs: 22, fiber: 8, category: "veg", isIndian: true },
  { name: "Chickpeas (boiled)", calories: 164, protein: 9, fat: 2.6, carbs: 27, fiber: 7.6, category: "veg", isIndian: true },
  { name: "Rajma (kidney beans, cooked)", calories: 140, protein: 8.7, fat: 0.5, carbs: 25, fiber: 6, category: "veg", isIndian: true },
  { name: "Black Beans (cooked)", calories: 132, protein: 8.9, fat: 0.5, carbs: 23.7, fiber: 8.7, category: "veg", isIndian: true },
  { name: "Soya Chunks (hydrated)", calories: 98, protein: 16.6, fat: 0.5, carbs: 9.9, fiber: 7, category: "veg", isIndian: true },
  
  // Vegetables
  { name: "Potato (boiled)", calories: 87, protein: 2, fat: 0.1, carbs: 20, fiber: 1.8, category: "veg", isIndian: true },
  { name: "Sweet Potato (boiled)", calories: 86, protein: 1.6, fat: 0.1, carbs: 20, fiber: 3, category: "veg", isIndian: true },
  { name: "Broccoli", calories: 55, protein: 3.7, fat: 0.6, carbs: 11, fiber: 3.3, category: "veg", isIndian: true },
  { name: "Spinach", calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, category: "veg", isIndian: true },
  { name: "Carrot", calories: 41, protein: 0.9, fat: 0.2, carbs: 10, fiber: 2.8, category: "veg", isIndian: true },
  { name: "Tomato", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, category: "veg", isIndian: true },
  { name: "Beetroot (boiled)", calories: 44, protein: 1.6, fat: 0.2, carbs: 10, fiber: 2.8, category: "veg", isIndian: true },
  { name: "Cabbage (cooked)", calories: 25, protein: 1.3, fat: 0.1, carbs: 6, fiber: 2.5, category: "veg", isIndian: true },
  { name: "Cauliflower (cooked)", calories: 23, protein: 1.8, fat: 0.5, carbs: 5, fiber: 2, category: "veg", isIndian: true },
  { name: "Green Peas (boiled)", calories: 84, protein: 5.4, fat: 0.4, carbs: 15, fiber: 5, category: "veg", isIndian: true },
  { name: "Ladyfinger (bhindi, cooked)", calories: 88, protein: 2, fat: 5, carbs: 10, fiber: 3.2, category: "veg", isIndian: true },
  { name: "Brinjal (eggplant, cooked)", calories: 35, protein: 1, fat: 0.2, carbs: 9, fiber: 2.5, category: "veg", isIndian: true },
  { name: "Cucumber", calories: 16, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5, category: "veg", isIndian: true },
  { name: "Onion (raw)", calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7, category: "veg", isIndian: true },
  
  // Fruits
  { name: "Banana", calories: 89, protein: 1.1, fat: 0.3, carbs: 23, fiber: 2.6, category: "fruits", isIndian: true },
  { name: "Apple", calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, category: "fruits", isIndian: true },
  { name: "Orange", calories: 47, protein: 0.9, fat: 0.1, carbs: 12, fiber: 2.4, category: "fruits", isIndian: true },
  { name: "Papaya", calories: 43, protein: 0.5, fat: 0.3, carbs: 11, fiber: 1.7, category: "fruits", isIndian: true },
  { name: "Mango", calories: 60, protein: 0.8, fat: 0.4, carbs: 15, fiber: 1.6, category: "fruits", isIndian: true },
  
  // Nuts & Seeds
  { name: "Peanuts", calories: 567, protein: 26, fat: 49, carbs: 16, fiber: 8.5, category: "nuts", isIndian: true },
  { name: "Almonds", calories: 579, protein: 21, fat: 50, carbs: 22, fiber: 12.5, category: "nuts", isIndian: true },
  { name: "Cashews", calories: 553, protein: 18, fat: 44, carbs: 30, fiber: 3.3, category: "nuts", isIndian: true },
  { name: "Walnuts", calories: 654, protein: 15, fat: 65, carbs: 14, fiber: 6.7, category: "nuts", isIndian: true },
  
  // Oils & Fats
  { name: "Olive Oil", calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, category: "oils", isIndian: false },
  { name: "Ghee", calories: 900, protein: 0, fat: 100, carbs: 0, fiber: 0, category: "oils", isIndian: true },
  
  // Other Proteins
  { name: "Tofu", calories: 76, protein: 8, fat: 4.8, carbs: 1.9, fiber: 0.3, category: "veg", isIndian: false },
  
  // Indian Breakfast Items
  { name: "Idli", calories: 60, protein: 2, fat: 0.4, carbs: 12, fiber: 1, category: "grains", isIndian: true },
  { name: "Dosa (plain)", calories: 168, protein: 3.9, fat: 6.8, carbs: 25, fiber: 1, category: "grains", isIndian: true },
  { name: "Upma", calories: 190, protein: 4, fat: 6, carbs: 29, fiber: 3, category: "grains", isIndian: true },
  { name: "Poha", calories: 130, protein: 2.3, fat: 2.4, carbs: 23, fiber: 1.8, category: "grains", isIndian: true },
  { name: "Rava Upma", calories: 180, protein: 3.6, fat: 5.5, carbs: 30, fiber: 2, category: "grains", isIndian: true },
  
  // Indian Dishes
  { name: "Chole (chickpea curry)", calories: 180, protein: 9, fat: 6, carbs: 23, fiber: 6, category: "veg", isIndian: true },
  { name: "Palak Paneer", calories: 230, protein: 12, fat: 18, carbs: 10, fiber: 3, category: "veg", isIndian: true },
  { name: "Aloo Gobi", calories: 120, protein: 3, fat: 5, carbs: 16, fiber: 4, category: "veg", isIndian: true },
  { name: "Vegetable Pulao", calories: 160, protein: 3.5, fat: 4, carbs: 28, fiber: 2.5, category: "veg", isIndian: true },
  { name: "Sambar", calories: 60, protein: 3, fat: 1, carbs: 9, fiber: 2, category: "veg", isIndian: true },
  { name: "Vegetable Soup (homestyle)", calories: 45, protein: 1.5, fat: 1, carbs: 8, fiber: 2, category: "veg", isIndian: true },
]

export default function NutritionGuidePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [portion, setPortion] = useState(100)
  const [dailyMeals, setDailyMeals] = useState<Array<{food: FoodItem, portion: number}>>([])

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
      loadDailyMeals(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadDailyMeals = (userId: string) => {
    const saved = localStorage.getItem(`nutritionPlan_${userId}`)
    if (saved) {
      const data = JSON.parse(saved)
      const today = new Date().toDateString()
      if (data.date === today) {
        setDailyMeals(data.meals || [])
      }
    }
  }

  const saveDailyMeals = (meals: Array<{food: FoodItem, portion: number}>) => {
    if (currentUser?.userId) {
      const data = {
        date: new Date().toDateString(),
        meals,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(`nutritionPlan_${currentUser.userId}`, JSON.stringify(data))
    }
  }

  const filteredFoods = INDIAN_FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToMealPlan = () => {
    if (selectedFood) {
      const newMeals = [...dailyMeals, { food: selectedFood, portion }]
      setDailyMeals(newMeals)
      saveDailyMeals(newMeals)
      setSelectedFood(null)
      setPortion(100)
    }
  }

  const removeMeal = (index: number) => {
    const newMeals = dailyMeals.filter((_, i) => i !== index)
    setDailyMeals(newMeals)
    saveDailyMeals(newMeals)
  }

  const calculateTotals = () => {
    return dailyMeals.reduce((acc, meal) => {
      const multiplier = meal.portion / 100
      return {
        calories: acc.calories + (meal.food.calories * multiplier),
        protein: acc.protein + (meal.food.protein * multiplier),
        fat: acc.fat + (meal.food.fat * multiplier),
        carbs: acc.carbs + (meal.food.carbs * multiplier),
        fiber: acc.fiber + (meal.food.fiber * multiplier)
      }
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })
  }

  const totals = calculateTotals()

  const getCategoryIcon = (category: string) => {
    const icons = {
      "veg": "🥗",
      "non-veg": "🍗",
      "dairy": "🥛",
      "grains": "🌾",
      "fruits": "🍎",
      "nuts": "🥜",
      "oils": "🫒",
      "all": "🍽️"
    }
    return icons[category] || "🍽️"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
        {/* Header */}
        <header className="flex justify-between items-center py-4 sm:py-5 mb-6 sm:mb-8 border-b border-white/10">
          <Link href="/" className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] flex items-center gap-2 sm:gap-3 no-underline">
            <i className="fas fa-leaf"></i>
            VitalSync
          </Link>

          <div className="hidden md:flex gap-5">
            <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Dashboard</Link>
            <Link href="/workout" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Workouts</Link>
            <Link href="/bmi" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">BMI</Link>
            <Link href="/diet" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Diet</Link>
            <Link href="/nutrition" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-2 rounded-lg">Nutrition</Link>
            <Link href="/hydration" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Hydration</Link>
            <Link href="/sleep" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Sleep</Link>
            <Link href="/health" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Health</Link>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10">
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </header>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <span>📚</span> Indian Nutrition Guide
          </h1>
          <p className="text-[#94a3b8] text-lg">Comprehensive database of Indian foods with accurate macronutrient values per 100g</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Food Database */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Filters */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Search foods (e.g., 'dal', 'chicken', 'rice')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "veg", "non-veg", "dairy", "grains", "fruits", "nuts"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white"
                        : "bg-white/10 text-[#94a3b8] hover:bg-white/20"
                    }`}
                  >
                    {getCategoryIcon(cat)} {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFoods.map((food, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedFood(food)}
                  className={`bg-white/5 border-2 rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 ${
                    selectedFood?.name === food.name ? "border-[#4ade80]" : "border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{food.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-white/10 rounded-full">{getCategoryIcon(food.category)} {food.category}</span>
                        {food.isIndian && <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full">🇮🇳 Indian</span>}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#4ade80]">{food.calories}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-500/10 p-2 rounded">
                      <div className="text-xs text-blue-300">Protein</div>
                      <div className="font-bold">{food.protein}g</div>
                    </div>
                    <div className="bg-yellow-500/10 p-2 rounded">
                      <div className="text-xs text-yellow-300">Carbs</div>
                      <div className="font-bold">{food.carbs}g</div>
                    </div>
                    <div className="bg-orange-500/10 p-2 rounded">
                      <div className="text-xs text-orange-300">Fat</div>
                      <div className="font-bold">{food.fat}g</div>
                    </div>
                    <div className="bg-green-500/10 p-2 rounded">
                      <div className="text-xs text-green-300">Fiber</div>
                      <div className="font-bold">{food.fiber}g</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFoods.length === 0 && (
              <div className="text-center py-12 text-[#94a3b8]">
                <i className="fas fa-search text-4xl mb-4"></i>
                <p>No foods found matching your search</p>
              </div>
            )}
          </div>

          {/* Right Panel - Meal Planner */}
          <div className="space-y-6">
            {/* Selected Food */}
            {selectedFood && (
              <div className="bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/20 border border-[#4ade80]/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Add to Meal Plan</h3>
                <div className="mb-4">
                  <div className="font-semibold text-lg mb-2">{selectedFood.name}</div>
                  <div>
                    <label className="block text-sm mb-2">Portion (grams)</label>
                    <input
                      type="number"
                      value={portion}
                      onChange={(e) => setPortion(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-white/10 p-2 rounded">
                    <div className="text-xs text-[#94a3b8]">Calories</div>
                    <div className="font-bold">{Math.round(selectedFood.calories * portion / 100)} kcal</div>
                  </div>
                  <div className="bg-white/10 p-2 rounded">
                    <div className="text-xs text-[#94a3b8]">Protein</div>
                    <div className="font-bold">{(selectedFood.protein * portion / 100).toFixed(1)}g</div>
                  </div>
                  <div className="bg-white/10 p-2 rounded">
                    <div className="text-xs text-[#94a3b8]">Carbs</div>
                    <div className="font-bold">{(selectedFood.carbs * portion / 100).toFixed(1)}g</div>
                  </div>
                  <div className="bg-white/10 p-2 rounded">
                    <div className="text-xs text-[#94a3b8]">Fat</div>
                    <div className="font-bold">{(selectedFood.fat * portion / 100).toFixed(1)}g</div>
                  </div>
                </div>

                <button
                  onClick={addToMealPlan}
                  className="w-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add to Plan
                </button>
              </div>
            )}

            {/* Today's Totals */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Today's Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Calories</span>
                  <span className="text-2xl font-bold text-[#4ade80]">{Math.round(totals.calories)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Protein</span>
                  <span className="text-xl font-bold text-blue-400">{totals.protein.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Carbs</span>
                  <span className="text-xl font-bold text-yellow-400">{totals.carbs.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Fat</span>
                  <span className="text-xl font-bold text-orange-400">{totals.fat.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Fiber</span>
                  <span className="text-xl font-bold text-green-400">{totals.fiber.toFixed(1)}g</span>
                </div>
              </div>
            </div>

            {/* Meal Plan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Today's Meal Plan</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dailyMeals.map((meal, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-semibold">{meal.food.name}</div>
                      <div className="text-xs text-[#94a3b8]">{meal.portion}g • {Math.round(meal.food.calories * meal.portion / 100)} kcal</div>
                    </div>
                    <button
                      onClick={() => removeMeal(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
                {dailyMeals.length === 0 && (
                  <p className="text-[#94a3b8] text-center py-8 text-sm">No meals added yet. Select a food to start!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <i className="fas fa-info-circle text-2xl text-purple-400"></i>
            <div>
              <h4 className="font-bold mb-2">About This Nutrition Database</h4>
              <p className="text-sm text-[#94a3b8]">
                All values are per 100g of food. This comprehensive Indian food database includes accurate macronutrient 
                (protein, carbs, fat) and fiber content for common vegetarian and non-vegetarian items. Use this to plan 
                balanced meals and track your daily nutrition intake effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}