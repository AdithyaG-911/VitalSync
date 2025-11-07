"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BMIPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMetric, setIsMetric] = useState(true)
  const [height, setHeight] = useState("175")
  const [weight, setWeight] = useState("70")
  const [feet, setFeet] = useState("5")
  const [inches, setInches] = useState("9")
  const [pounds, setPounds] = useState("150")
  const [bmi, setBmi] = useState<number | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Ref to prevent initial calculation on mount before data is loaded
  const isInitialMount = useRef(true)

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
      loadBMIData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadBMIData = (userId: string) => {
    const savedBMI = localStorage.getItem(`bmiData_${userId}`)
    if (savedBMI) {
      const data = JSON.parse(savedBMI)
      setIsMetric(data.isMetric ?? true)
      setHeight(data.height || "175")
      setWeight(data.weight || "70")
      setFeet(data.feet || "5")
      setInches(data.inches || "9")
      setPounds(data.pounds || "150")
      if (data.bmi) {
        setBmi(data.bmi)
      }
    }
    isInitialMount.current = false // Data loaded, allow calculations
  }

  const saveBMIData = () => {
    if (currentUser?.userId) {
      const data = {
        isMetric,
        height,
        weight,
        feet,
        inches,
        pounds,
        bmi,
        lastCalculated: new Date().toISOString(),
      }
      localStorage.setItem(`bmiData_${currentUser.userId}`, JSON.stringify(data))
    }
  }

  useEffect(() => {
    if (!isInitialMount.current) {
      // Only calculate after initial data load
      calculateBMI()
    }
  }, [height, weight, feet, inches, pounds, isMetric])

  useEffect(() => {
    if (bmi !== null) {
      saveBMIData()
    }
  }, [bmi, isMetric, height, weight, feet, inches, pounds])

  const calculateBMI = () => {
    let calculatedBmi: number
    if (isMetric) {
      const heightValue = Number.parseFloat(height)
      const weightValue = Number.parseFloat(weight)
      if (!heightValue || !weightValue || heightValue <= 0 || weightValue <= 0) {
        setBmi(null)
        return
      }
      const heightM = heightValue / 100
      calculatedBmi = weightValue / (heightM * heightM)
    } else {
      const feetValue = Number.parseFloat(feet) || 0
      const inchesValue = Number.parseFloat(inches) || 0
      const poundsValue = Number.parseFloat(pounds)
      if ((feetValue <= 0 && inchesValue <= 0) || poundsValue <= 0) {
        setBmi(null)
        return
      }
      const totalInches = feetValue * 12 + inchesValue
      calculatedBmi = (poundsValue / (totalInches * totalInches)) * 703
    }
    setBmi(calculatedBmi)
  }

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 16)
      return {
        text: "Severely Underweight",
        color: "#3B82F6",
        bgColor: "rgba(59, 130, 246, 0.1)",
        description: "Significant health risks - consult a doctor",
        recommendations: [
          "Seek medical advice immediately",
          "Focus on nutrient-dense foods",
          "Consider working with a dietitian",
          "Monitor weight regularly",
        ],
      }
    if (bmiValue < 18.5)
      return {
        text: "Underweight",
        color: "#06B6D4",
        bgColor: "rgba(6, 182, 212, 0.1)",
        description: "Below healthy weight range",
        recommendations: [
          "Eat more frequent, balanced meals",
          "Include healthy fats and proteins",
          "Strength training to build muscle",
          "Consult a healthcare provider",
        ],
      }
    if (bmiValue < 25)
      return {
        text: "Healthy Weight",
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        description: "Ideal weight range - well done!",
        recommendations: [
          "Maintain balanced diet and exercise",
          "Regular health check-ups",
          "Stay hydrated and active",
          "Monitor weight monthly",
        ],
      }
    if (bmiValue < 30)
      return {
        text: "Overweight",
        color: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.1)",
        description: "Slightly above healthy range",
        recommendations: [
          "Increase physical activity",
          "Reduce processed foods",
          "Portion control strategies",
          "Set realistic weight goals",
        ],
      }
    if (bmiValue < 35)
      return {
        text: "Obese Class I",
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        description: "Increased health risks",
        recommendations: [
          "Consult healthcare professional",
          "Structured weight loss plan",
          "Regular aerobic exercise",
          "Focus on long-term changes",
        ],
      }
    if (bmiValue < 40)
      return {
        text: "Obese Class II",
        color: "#DC2626",
        bgColor: "rgba(220, 38, 38, 0.1)",
        description: "High health risks",
        recommendations: [
          "Medical supervision recommended",
          "Comprehensive lifestyle changes",
          "Behavioral therapy options",
          "Support group consideration",
        ],
      }
    return {
      text: "Obese Class III",
      color: "#B91C1C",
      bgColor: "rgba(185, 28, 28, 0.1)",
      description: "Severe health risks - urgent action needed",
      recommendations: [
        "Immediate medical attention",
        "Supervised weight management",
        "Possible bariatric evaluation",
        "Multidisciplinary approach",
      ],
    }
  }

  const getNeedleRotation = (bmiValue: number) => {
    // Map BMI values to degrees (-90 to +90 for half circle)
    // BMI range 15-40 maps to -90 to +90 degrees (total 180 degrees)
    const minBMI = 15
    const maxBMI = 40
    const angleRange = 180 // Total angle for the meter
    const startAngle = -90 // Starting angle (leftmost point of half circle)

    // Clamp BMI value to the defined range
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmiValue))

    // Calculate the percentage of the way through the BMI range
    const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI)

    // Convert percentage to angle
    return startAngle + percentage * angleRange
  }

  const category = bmi ? getBMICategory(bmi) : null
  const needleRotation = bmi ? getNeedleRotation(bmi) : -90

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
        {/* Header */}
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
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10 text-[#4ade80] bg-white/10"
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
                className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-3 rounded-lg transition-all"
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
            </div>
          </div>
        )}
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.2)] relative overflow-hidden">
          {/* Background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -left-12 w-24 sm:w-36 h-24 sm:h-36 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full opacity-5 blur-xl" />
            <div className="absolute -bottom-24 -right-12 w-32 sm:w-48 h-32 sm:h-48 bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full opacity-5 blur-xl" />
            <div className="absolute top-1/2 left-1/3 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-r from-[#F59E0B] to-[#EF4444] rounded-full opacity-5 blur-xl" />
          </div>
          <h1 className="text-center text-[#4ade80] mb-6 sm:mb-8 text-3xl sm:text-4xl font-bold relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <i className="fas fa-weight"></i> BMI Calculator
          </h1>
          {/* Unit Toggle */}
          <div className="flex justify-center mb-4 sm:mb-6 relative z-10">
            <button
              onClick={() => setIsMetric(true)}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium cursor-pointer transition-all flex items-center gap-2 border-none rounded-l-xl sm:rounded-l-2xl text-sm sm:text-base ${
                isMetric
                  ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white shadow-[0_6px_20px_rgba(74,222,128,0.4)]"
                  : "bg-white/10 text-[#94a3b8] hover:bg-white/20"
              }`}
            >
              <i className="fas fa-ruler-combined"></i> Metric
            </button>
            <button
              onClick={() => setIsMetric(false)}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium cursor-pointer transition-all flex items-center gap-2 border-none rounded-r-xl sm:rounded-r-2xl text-sm sm:text-base ${
                !isMetric
                  ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white shadow-[0_6px_20px_rgba(74,222,128,0.4)]"
                  : "bg-white/10 text-[#94a3b8] hover:bg-white/20"
              }`}
            >
              <i className="fas fa-ruler"></i> Imperial
            </button>
          </div>
          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mb-6 sm:mb-8 relative z-10">
            {isMetric ? (
              <>
                <div className="flex-1 relative">
                  <label className="block mb-2 text-[#94a3b8] font-medium text-sm">
                    <i className="fas fa-ruler-vertical mr-1"></i> Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-3 sm:p-4 pr-10 sm:pr-12 border-2 border-white/20 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all bg-white/10 focus:outline-none focus:border-[#4ade80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.2)] focus:bg-white/20 hover:bg-white/20 text-white placeholder-[#94a3b8]"
                    placeholder="175"
                    min="100"
                    max="250"
                  />
                  <span className="absolute right-3 sm:right-4 top-9 sm:top-10 text-[#94a3b8] font-medium text-sm">
                    cm
                  </span>
                </div>
                <div className="flex-1 relative">
                  <label className="block mb-2 text-[#94a3b8] font-medium text-sm">
                    <i className="fas fa-weight-hanging mr-1"></i> Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 sm:p-4 pr-10 sm:pr-12 border-2 border-white/20 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all bg-white/10 focus:outline-none focus:border-[#4ade80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.2)] focus:bg-white/20 hover:bg-white/20 text-white placeholder-[#94a3b8]"
                    placeholder="70"
                    min="30"
                    max="300"
                    step="0.1"
                  />
                  <span className="absolute right-3 sm:right-4 top-9 sm:top-10 text-[#94a3b8] font-medium text-sm">
                    kg
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 relative">
                  <label className="block mb-2 text-[#94a3b8] font-medium text-sm">
                    <i className="fas fa-ruler-vertical mr-1"></i> Height (ft)
                  </label>
                  <input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    className="w-full p-3 sm:p-4 pr-10 sm:pr-12 border-2 border-white/20 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all bg-white/10 focus:outline-none focus:border-[#4ade80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.2)] focus:bg-white/20 hover:bg-white/20 text-white placeholder-[#94a3b8]"
                    placeholder="5"
                    min="3"
                    max="8"
                  />
                  <span className="absolute right-3 sm:right-4 top-9 sm:top-10 text-[#94a3b8] font-medium text-sm">
                    ft
                  </span>
                </div>
                <div className="flex-1 relative">
                  <label className="block mb-2 text-[#94a3b8] font-medium text-sm">
                    <i className="fas fa-ruler mr-1"></i> Height (in)
                  </label>
                  <input
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    className="w-full p-3 sm:p-4 pr-10 sm:pr-12 border-2 border-white/20 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all bg-white/10 focus:outline-none focus:border-[#4ade80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.2)] focus:bg-white/20 hover:bg-white/20 text-white placeholder-[#94a3b8]"
                    placeholder="9"
                    min="0"
                    max="11"
                  />
                  <span className="absolute right-3 sm:right-4 top-9 sm:top-10 text-[#94a3b8] font-medium text-sm">
                    in
                  </span>
                </div>
                <div className="flex-1 relative">
                  <label className="block mb-2 text-[#94a3b8] font-medium text-sm">
                    <i className="fas fa-weight-hanging mr-1"></i> Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={pounds}
                    onChange={(e) => setPounds(e.target.value)}
                    className="w-full p-3 sm:p-4 pr-10 sm:pr-12 border-2 border-white/20 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all bg-white/10 focus:outline-none focus:border-[#4ade80] focus:shadow-[0_0_0_3px_rgba(74,222,128,0.2)] focus:bg-white/20 hover:bg-white/20 text-white placeholder-[#94a3b8]"
                    placeholder="150"
                    min="50"
                    max="700"
                  />
                  <span className="absolute right-3 sm:right-4 top-9 sm:top-10 text-[#94a3b8] font-medium text-sm">
                    lbs
                  </span>
                </div>
              </>
            )}
          </div>
          {/* Half-Circle Speedometer */}
          <div className="relative w-full max-w-lg h-64 sm:h-72 mx-auto mb-6 sm:mb-8 z-10">
            <div className="relative w-full h-full">
              {/* Base half-circle with gradient */}
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-3/5 rounded-t-full overflow-hidden"
                style={{
                  background:
                    "linear-gradient(to right, #3B82F6 0%, #06B6D4 20%, #10B981 40%, #F59E0B 60%, #EF4444 80%, #B91C1C 100%)",
                }}
              />
              {/* Inner white mask to create the meter effect */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/5 h-2/5 bg-[#0f1419] rounded-t-full" />
              {/* Scale marks and labels - positioned to not obstruct center */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-3/5">
                {/* Scale marks */}
                <div
                  className="absolute bottom-0 left-[8%] w-0.5 h-3 sm:h-4 bg-white"
                  style={{ transformOrigin: "bottom center", transform: "rotate(-75deg)" }}
                />
                <div
                  className="absolute bottom-0 left-[25%] w-0.5 h-3 sm:h-4 bg-white"
                  style={{ transformOrigin: "bottom center", transform: "rotate(-40deg)" }}
                />
                <div
                  className="absolute bottom-0 left-1/2 w-0.5 h-3 sm:h-4 bg-white transform -translate-x-1/2"
                  style={{ transformOrigin: "bottom center" }}
                />
                <div
                  className="absolute bottom-0 right-[25%] w-0.5 h-3 sm:h-4 bg-white"
                  style={{ transformOrigin: "bottom center", transform: "rotate(40deg)" }}
                />
                <div
                  className="absolute bottom-0 right-[8%] w-0.5 h-3 sm:h-4 bg-white"
                  style={{ transformOrigin: "bottom center", transform: "rotate(75deg)" }}
                />
                {/* Scale labels - positioned outside the meter */}
                <div className="absolute left-[5%] bottom-1 sm:bottom-2 text-xs font-semibold text-white transform -translate-x-1/2">
                  15
                </div>
                <div className="absolute left-[22%] bottom-4 sm:bottom-6 text-xs font-semibold text-white transform -translate-x-1/2">
                  18.5
                </div>
                <div className="absolute left-1/2 bottom-6 sm:bottom-8 text-xs font-semibold text-white transform -translate-x-1/2">
                  25
                </div>
                <div className="absolute right-[22%] bottom-4 sm:bottom-6 text-xs font-semibold text-white transform -translate-x-1/2">
                  30
                </div>
                <div className="absolute right-[5%] bottom-1 sm:bottom-2 text-xs font-semibold text-white transform -translate-x-1/2">
                  40
                </div>
              </div>
              {/* Needle - Made longer and higher z-index */}
              <div
                className="absolute bottom-0 left-1/2 w-1 h-32 sm:h-36 bg-gradient-to-t from-white to-[#94a3b8] rounded-full transform-gpu transition-transform duration-1000 ease-out z-50 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${needleRotation}deg)`,
                }}
              />
              {/* Needle cap - Higher z-index */}
              <div className="absolute bottom-0 left-1/2 w-4 sm:w-5 h-4 sm:h-5 bg-gradient-to-br from-white to-[#94a3b8] rounded-full border-2 border-[#0f1419] transform -translate-x-1/2 -translate-y-2 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
              {/* BMI Display - Positioned lower and with semi-transparent background */}
              <div
                className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.15)] border-2 transition-all duration-500 text-center z-30"
                style={{
                  backgroundColor: category ? `${category.color}15` : "rgba(156, 163, 175, 0.1)",
                  borderColor: category?.color || "#9CA3AF",
                  color: category?.color || "#6B7280",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="text-xl sm:text-2xl font-bold">{bmi ? bmi.toFixed(1) : "--"}</div>
                <div className="text-xs font-medium opacity-80">BMI</div>
              </div>
            </div>
          </div>
          {/* Category Display */}
          <div className="text-center mb-4 sm:mb-6 relative z-10">
            <div
              className="text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wide transition-colors duration-500"
              style={{ color: category?.color || "#6B7280" }}
            >
              {category?.text || "Enter your details"}
            </div>
            <div className="text-sm sm:text-base text-[#94a3b8] font-medium">
              {category?.description || "BMI will be calculated automatically"}
            </div>
          </div>
          {/* BMI Ranges */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 relative z-10">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:transform hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.3)]">
              <div className="flex items-center">
                <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#3B82F6] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mr-2 sm:mr-3" />
                <span className="font-medium text-white text-sm sm:text-base">Underweight</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#94a3b8]">&lt; 18.5</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:transform hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)]">
              <div className="flex items-center">
                <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#10B981] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mr-2 sm:mr-3" />
                <span className="font-medium text-white text-sm sm:text-base">Normal</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#94a3b8]">18.5 - 24.9</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:transform hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)]">
              <div className="flex items-center">
                <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#F59E0B] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mr-2 sm:mr-3" />
                <span className="font-medium text-white text-sm sm:text-base">Overweight</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#94a3b8]">25.0 - 29.9</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:transform hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]">
              <div className="flex items-center">
                <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#EF4444] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mr-2 sm:mr-3" />
                <span className="font-medium text-white text-sm sm:text-base">Obese I</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#94a3b8]">30.0 - 34.9</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:transform hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-[rgba(220,38,38,0.1)] border-[rgba(220,38,38,0.3)]">
              <div className="flex items-center">
                <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#DC2626] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mr-2 sm:mr-3" />
                <span className="font-medium text-white text-sm sm:text-base">Obese II</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#94a3b8]">35.0 - 39.9</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:transform hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-[rgba(185,28,28,0.1)] border-[rgba(185,28,28,0.3)]">
              <div className="flex items-center">
                <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-[#B91C1C] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mr-2 sm:mr-3" />
                <span className="font-medium text-white text-sm sm:text-base">Obese III</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#94a3b8]">≥ 40.0</span>
            </div>
          </div>
          {/* Recommendations */}
          <div
            className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 relative z-10 transition-all duration-500"
            style={{
              backgroundColor: category?.bgColor || "rgba(156, 163, 175, 0.1)",
              borderLeftColor: category?.color || "#9CA3AF",
            }}
          >
            <h4
              className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold flex items-center gap-2 sm:gap-3"
              style={{ color: category?.color || "#6B7280" }}
            >
              <i className="fas fa-heartbeat"></i> Health Recommendations
            </h4>
            <ul className="list-none">
              {category?.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-white text-sm leading-relaxed relative pl-5 sm:pl-6 mb-2 sm:mb-3 flex items-start"
                >
                  <span
                    className="absolute left-0 top-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{rec}</span>
                </li>
              )) || (
                <li className="text-white text-sm leading-relaxed relative pl-5 sm:pl-6 mb-2 sm:mb-3 flex items-start">
                  <span className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-400" />
                  <span>Enter your details to see personalized recommendations</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
