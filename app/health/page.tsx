"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HealthData {
  age: number
  gender: "male" | "female"
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  cholesterol: number
  glucose: number
  smoking: boolean
  alcoholConsumption: boolean
  physicalActivity: "low" | "moderate" | "high"
  familyHistory: string[]
}

interface RiskAssessment {
  heartDisease: { risk: number; level: "Low" | "Moderate" | "High" | "Very High" }
  diabetes: { risk: number; level: "Low" | "Moderate" | "High" | "Very High" }
  stroke: { risk: number; level: "Low" | "Moderate" | "High" | "Very High" }
  hypertension: { risk: number; level: "Low" | "Moderate" | "High" | "Very High" }
  overallRisk: "Low" | "Moderate" | "High" | "Very High"
}

export default function HealthPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [healthData, setHealthData] = useState<HealthData>({
    age: 30,
    gender: "male",
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    cholesterol: 200,
    glucose: 100,
    smoking: false,
    alcoholConsumption: false,
    physicalActivity: "moderate",
    familyHistory: [],
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
      loadHealthData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadHealthData = (userId: string) => {
    const savedData = localStorage.getItem(`healthData_${userId}`)
    if (savedData) {
      const data = JSON.parse(savedData)
      if (data.healthData) setHealthData(data.healthData)
      if (data.riskAssessment) setRiskAssessment(data.riskAssessment)
    }
  }

  const saveHealthData = (data: HealthData, assessment: RiskAssessment) => {
    if (currentUser?.userId) {
      const saveData = {
        healthData: data,
        riskAssessment: assessment,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(`healthData_${currentUser.userId}`, JSON.stringify(saveData))
    }
  }

  // Simple ML-based risk assessment algorithm
  const calculateRiskAssessment = (): RiskAssessment => {
    // Heart Disease Risk
    let heartRisk = 0
    if (healthData.age > 45) heartRisk += 20
    if (healthData.age > 65) heartRisk += 20
    if (healthData.bloodPressureSystolic > 140) heartRisk += 25
    if (healthData.cholesterol > 240) heartRisk += 20
    if (healthData.smoking) heartRisk += 30
    if (healthData.familyHistory.includes("heart")) heartRisk += 15
    if (healthData.physicalActivity === "low") heartRisk += 10
    
    // Diabetes Risk
    let diabetesRisk = 0
    if (healthData.age > 45) diabetesRisk += 15
    if (healthData.glucose > 126) diabetesRisk += 40
    if (healthData.glucose > 100) diabetesRisk += 20
    if (healthData.familyHistory.includes("diabetes")) diabetesRisk += 25
    if (healthData.physicalActivity === "low") diabetesRisk += 15
    if (healthData.cholesterol > 200) diabetesRisk += 10

    // Stroke Risk
    let strokeRisk = 0
    if (healthData.age > 55) strokeRisk += 20
    if (healthData.bloodPressureSystolic > 140) strokeRisk += 30
    if (healthData.smoking) strokeRisk += 25
    if (healthData.familyHistory.includes("stroke")) strokeRisk += 20
    if (healthData.alcoholConsumption) strokeRisk += 10
    if (healthData.physicalActivity === "low") strokeRisk += 10

    // Hypertension Risk
    let hypertensionRisk = 0
    if (healthData.bloodPressureSystolic > 130 || healthData.bloodPressureDiastolic > 85) hypertensionRisk += 40
    if (healthData.age > 40) hypertensionRisk += 15
    if (healthData.familyHistory.includes("hypertension")) hypertensionRisk += 20
    if (healthData.smoking) hypertensionRisk += 15
    if (healthData.physicalActivity === "low") hypertensionRisk += 10

    const getRiskLevel = (score: number): "Low" | "Moderate" | "High" | "Very High" => {
      if (score < 25) return "Low"
      if (score < 50) return "Moderate"
      if (score < 75) return "High"
      return "Very High"
    }

    const avgRisk = (heartRisk + diabetesRisk + strokeRisk + hypertensionRisk) / 4
    
    return {
      heartDisease: { risk: Math.min(heartRisk, 100), level: getRiskLevel(heartRisk) },
      diabetes: { risk: Math.min(diabetesRisk, 100), level: getRiskLevel(diabetesRisk) },
      stroke: { risk: Math.min(strokeRisk, 100), level: getRiskLevel(strokeRisk) },
      hypertension: { risk: Math.min(hypertensionRisk, 100), level: getRiskLevel(hypertensionRisk) },
      overallRisk: getRiskLevel(avgRisk),
    }
  }

  const runAssessment = () => {
    const assessment = calculateRiskAssessment()
    setRiskAssessment(assessment)
    saveHealthData(healthData, assessment)
    setShowAssessmentModal(false)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-[#4ade80]"
      case "Moderate": return "text-yellow-400"
      case "High": return "text-orange-400"
      case "Very High": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getRiskBg = (level: string) => {
    switch (level) {
      case "Low": return "bg-[#4ade80]/20 border-[#4ade80]"
      case "Moderate": return "bg-yellow-400/20 border-yellow-400"
      case "High": return "bg-orange-400/20 border-orange-400"
      case "Very High": return "bg-red-400/20 border-red-400"
      default: return "bg-gray-400/20 border-gray-400"
    }
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
          <Link href="/" className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] flex items-center gap-2 sm:gap-3 no-underline">
            <i className="fas fa-leaf"></i>
            VitalSync
          </Link>

          <div className="hidden md:flex gap-5">
            <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Dashboard</Link>
            <Link href="/workout" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Workouts</Link>
            <Link href="/bmi" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">BMI</Link>
            <Link href="/diet" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Diet</Link>
            <Link href="/hydration" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Hydration</Link>
            <Link href="/sleep" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Sleep</Link>
            <Link href="/health" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-2 rounded-lg">Health</Link>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10">
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </header>

        {showMobileMenu && (
          <div className="md:hidden mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-home mr-2"></i> Dashboard</Link>
              <Link href="/workout" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-dumbbell mr-2"></i> Workouts</Link>
              <Link href="/bmi" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-weight mr-2"></i> BMI</Link>
              <Link href="/diet" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-utensils mr-2"></i> Diet</Link>
              <Link href="/hydration" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-tint mr-2"></i> Hydration</Link>
              <Link href="/sleep" className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-moon mr-2"></i> Sleep</Link>
              <Link href="/health" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-3 rounded-lg" onClick={() => setShowMobileMenu(false)}><i className="fas fa-heartbeat mr-2"></i> Health</Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4ade80]">Health Risk Assessment</h2>
                <button onClick={() => setShowAssessmentModal(true)} className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-4 py-2 rounded-lg transform hover:-translate-y-1">
                  <i className="fas fa-stethoscope mr-2"></i>{riskAssessment ? "Update" : "Start"} Assessment
                </button>
              </div>

              {riskAssessment ? (
                <>
                  <div className={`p-6 rounded-xl mb-6 border-2 ${getRiskBg(riskAssessment.overallRisk)}`}>
                    <div className="text-center">
                      <div className="text-sm font-medium mb-2">Overall Health Risk</div>
                      <div className={`text-4xl font-bold ${getRiskColor(riskAssessment.overallRisk)}`}>{riskAssessment.overallRisk}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border-2 border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-heart text-red-400"></i>
                          <span className="font-semibold">Heart Disease</span>
                        </div>
                        <span className={`font-bold ${getRiskColor(riskAssessment.heartDisease.level)}`}>{riskAssessment.heartDisease.level}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`h-2 rounded-full ${riskAssessment.heartDisease.level === "Low" ? "bg-[#4ade80]" : riskAssessment.heartDisease.level === "Moderate" ? "bg-yellow-400" : riskAssessment.heartDisease.level === "High" ? "bg-orange-400" : "bg-red-400"}`} style={{ width: `${riskAssessment.heartDisease.risk}%` }} />
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-2">Risk Score: {riskAssessment.heartDisease.risk}%</div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border-2 border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-syringe text-blue-400"></i>
                          <span className="font-semibold">Diabetes</span>
                        </div>
                        <span className={`font-bold ${getRiskColor(riskAssessment.diabetes.level)}`}>{riskAssessment.diabetes.level}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`h-2 rounded-full ${riskAssessment.diabetes.level === "Low" ? "bg-[#4ade80]" : riskAssessment.diabetes.level === "Moderate" ? "bg-yellow-400" : riskAssessment.diabetes.level === "High" ? "bg-orange-400" : "bg-red-400"}`} style={{ width: `${riskAssessment.diabetes.risk}%` }} />
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-2">Risk Score: {riskAssessment.diabetes.risk}%</div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border-2 border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-brain text-purple-400"></i>
                          <span className="font-semibold">Stroke</span>
                        </div>
                        <span className={`font-bold ${getRiskColor(riskAssessment.stroke.level)}`}>{riskAssessment.stroke.level}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`h-2 rounded-full ${riskAssessment.stroke.level === "Low" ? "bg-[#4ade80]" : riskAssessment.stroke.level === "Moderate" ? "bg-yellow-400" : riskAssessment.stroke.level === "High" ? "bg-orange-400" : "bg-red-400"}`} style={{ width: `${riskAssessment.stroke.risk}%` }} />
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-2">Risk Score: {riskAssessment.stroke.risk}%</div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border-2 border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-heartbeat text-orange-400"></i>
                          <span className="font-semibold">Hypertension</span>
                        </div>
                        <span className={`font-bold ${getRiskColor(riskAssessment.hypertension.level)}`}>{riskAssessment.hypertension.level}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`h-2 rounded-full ${riskAssessment.hypertension.level === "Low" ? "bg-[#4ade80]" : riskAssessment.hypertension.level === "Moderate" ? "bg-yellow-400" : riskAssessment.hypertension.level === "High" ? "bg-orange-400" : "bg-red-400"}`} style={{ width: `${riskAssessment.hypertension.risk}%` }} />
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-2">Risk Score: {riskAssessment.hypertension.risk}%</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏥</div>
                  <p className="text-xl font-semibold mb-2">No Assessment Yet</p>
                  <p className="text-[#94a3b8] mb-6">Start your health risk assessment to get personalized insights</p>
                </div>
              )}
            </div>

            {riskAssessment && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  {riskAssessment.heartDisease.level !== "Low" && (
                    <div className="flex items-start gap-3 p-3 bg-red-400/10 rounded-lg border border-red-400/30">
                      <i className="fas fa-exclamation-triangle text-red-400 mt-1"></i>
                      <div>
                        <p className="font-semibold">Heart Health Priority</p>
                        <p className="text-sm text-[#94a3b8]">Consider consulting a cardiologist, increase physical activity, and reduce stress.</p>
                      </div>
                    </div>
                  )}
                  {riskAssessment.diabetes.level !== "Low" && (
                    <div className="flex items-start gap-3 p-3 bg-blue-400/10 rounded-lg border border-blue-400/30">
                      <i className="fas fa-exclamation-triangle text-blue-400 mt-1"></i>
                      <div>
                        <p className="font-semibold">Monitor Blood Sugar</p>
                        <p className="text-sm text-[#94a3b8]">Regular glucose monitoring and dietary adjustments recommended.</p>
                      </div>
                    </div>
                  )}
                  {healthData.smoking && (
                    <div className="flex items-start gap-3 p-3 bg-orange-400/10 rounded-lg border border-orange-400/30">
                      <i className="fas fa-smoking-ban text-orange-400 mt-1"></i>
                      <div>
                        <p className="font-semibold">Quit Smoking</p>
                        <p className="text-sm text-[#94a3b8]">Smoking significantly increases health risks. Consider cessation programs.</p>
                      </div>
                    </div>
                  )}
                  {healthData.physicalActivity === "low" && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                      <i className="fas fa-running text-yellow-400 mt-1"></i>
                      <div>
                        <p className="font-semibold">Increase Physical Activity</p>
                        <p className="text-sm text-[#94a3b8]">Aim for at least 150 minutes of moderate exercise per week.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Health Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <i className="fas fa-heartbeat text-[#4ade80] mt-1"></i>
                  <div>
                    <p className="font-medium mb-1">Regular Checkups</p>
                    <p className="text-[#94a3b8]">Visit your doctor annually for comprehensive health screenings.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-running text-[#4ade80] mt-1"></i>
                  <div>
                    <p className="font-medium mb-1">Stay Active</p>
                    <p className="text-[#94a3b8]">Regular exercise reduces risk of chronic diseases significantly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-apple-alt text-[#4ade80] mt-1"></i>
                  <div>
                    <p className="font-medium mb-1">Balanced Diet</p>
                    <p className="text-[#94a3b8]">Eat plenty of fruits, vegetables, and whole grains.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-bed text-[#4ade80] mt-1"></i>
                  <div>
                    <p className="font-medium mb-1">Quality Sleep</p>
                    <p className="text-[#94a3b8]">Get 7-9 hours of sleep for optimal health and recovery.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-red-400"></i>
                Disclaimer
              </h3>
              <p className="text-sm text-[#94a3b8]">
                This assessment is for informational purposes only and does not replace professional medical advice. 
                Always consult with qualified healthcare providers for diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Modal */}
        {showAssessmentModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white/95 w-full max-w-2xl rounded-2xl p-6 text-gray-800 my-8">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Health Assessment Form</h2>
                <button onClick={() => setShowAssessmentModal(false)} className="text-3xl">×</button>
              </div>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <input type="number" value={healthData.age} onChange={(e) => setHealthData({ ...healthData, age: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select value={healthData.gender} onChange={(e) => setHealthData({ ...healthData, gender: e.target.value as any })} className="w-full px-4 py-3 border rounded-lg">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">BP Systolic (mmHg)</label>
                    <input type="number" value={healthData.bloodPressureSystolic} onChange={(e) => setHealthData({ ...healthData, bloodPressureSystolic: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">BP Diastolic (mmHg)</label>
                    <input type="number" value={healthData.bloodPressureDiastolic} onChange={(e) => setHealthData({ ...healthData, bloodPressureDiastolic: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cholesterol (mg/dL)</label>
                    <input type="number" value={healthData.cholesterol} onChange={(e) => setHealthData({ ...healthData, cholesterol: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Glucose (mg/dL)</label>
                    <input type="number" value={healthData.glucose} onChange={(e) => setHealthData({ ...healthData, glucose: Number(e.target.value) })} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Physical Activity Level</label>
                  <select value={healthData.physicalActivity} onChange={(e) => setHealthData({ ...healthData, physicalActivity: e.target.value as any })} className="w-full px-4 py-3 border rounded-lg">
                    <option value="low">Low (Sedentary)</option>
                    <option value="moderate">Moderate (3-4 days/week)</option>
                    <option value="high">High (5+ days/week)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <input type="checkbox" checked={healthData.smoking} onChange={(e) => setHealthData({ ...healthData, smoking: e.target.checked })} className="w-5 h-5" />
                    <label className="text-sm font-medium">Current Smoker</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <input type="checkbox" checked={healthData.alcoholConsumption} onChange={(e) => setHealthData({ ...healthData, alcoholConsumption: e.target.checked })} className="w-5 h-5" />
                    <label className="text-sm font-medium">Regular Alcohol</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Family History (Select all that apply)</label>
                  <div className="space-y-2">
                    {["heart", "diabetes", "stroke", "hypertension", "cancer"].map((condition) => (
                      <label key={condition} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={healthData.familyHistory.includes(condition)} onChange={(e) => {
                          if (e.target.checked) {
                            setHealthData({ ...healthData, familyHistory: [...healthData.familyHistory, condition] })
                          } else {
                            setHealthData({ ...healthData, familyHistory: healthData.familyHistory.filter(h => h !== condition) })
                          }
                        }} className="w-4 h-4" />
                        <span className="capitalize">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAssessmentModal(false)} className="flex-1 bg-gray-200 py-3 rounded-lg font-medium">Cancel</button>
                <button onClick={runAssessment} className="flex-1 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 rounded-lg font-medium">Calculate Risk</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
