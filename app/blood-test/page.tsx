"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BloodTestData {
  // Complete Blood Count (CBC)
  hemoglobin: number
  wbc: number
  platelets: number
  
  // Lipid Profile
  totalCholesterol: number
  ldl: number
  hdl: number
  triglycerides: number
  
  // Blood Sugar
  fastingGlucose: number
  hba1c: number
  
  // Liver Function
  sgpt: number
  sgot: number
  
  // Kidney Function
  creatinine: number
  urea: number
  
  // Thyroid
  tsh: number
  
  // Vitamins
  vitaminD: number
  vitaminB12: number
  
  // Others
  uricAcid: number
  iron: number
  
  testDate: string
}

interface AIRecommendation {
  category: string
  severity: "normal" | "attention" | "concern" | "critical"
  message: string
  action: string[]
  icon: string
}

export default function BloodTestPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showInputModal, setShowInputModal] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [bloodTestData, setBloodTestData] = useState<BloodTestData | null>(null)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [formData, setFormData] = useState<BloodTestData>({
    hemoglobin: 14,
    wbc: 7000,
    platelets: 250000,
    totalCholesterol: 180,
    ldl: 100,
    hdl: 50,
    triglycerides: 120,
    fastingGlucose: 95,
    hba1c: 5.4,
    sgpt: 30,
    sgot: 28,
    creatinine: 1.0,
    urea: 25,
    tsh: 2.5,
    vitaminD: 30,
    vitaminB12: 400,
    uricAcid: 5.5,
    iron: 80,
    testDate: new Date().toISOString().split('T')[0]
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
      loadBloodTestData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadBloodTestData = (userId: string) => {
    const saved = localStorage.getItem(`bloodTest_${userId}`)
    if (saved) {
      const data = JSON.parse(saved)
      setBloodTestData(data.bloodTest)
      setRecommendations(data.recommendations || [])
    }
  }

  const saveBloodTestData = (data: BloodTestData, recs: AIRecommendation[]) => {
    if (currentUser?.userId) {
      localStorage.setItem(`bloodTest_${currentUser.userId}`, JSON.stringify({
        bloodTest: data,
        recommendations: recs,
        lastUpdated: new Date().toISOString()
      }))
    }
  }

  const analyzeBloodTest = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    // Simulate AI analysis with progress
    const messages = [
      "Analyzing blood test parameters...",
      "Comparing with healthy ranges...",
      "Evaluating metabolic health...",
      "Checking cardiovascular markers...",
      "Assessing vitamin levels...",
      "Generating personalized recommendations...",
      "Finalizing AI insights..."
    ]
    
    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setAnalysisProgress(((i + 1) / messages.length) * 100)
    }
    
    // Generate AI recommendations
    const recs = generateRecommendations(formData)
    setRecommendations(recs)
    setBloodTestData(formData)
    saveBloodTestData(formData, recs)
    
    setIsAnalyzing(false)
    setShowInputModal(false)
  }

  const generateRecommendations = (data: BloodTestData): AIRecommendation[] => {
    const recs: AIRecommendation[] = []

    // Hemoglobin Analysis
    if (data.hemoglobin < 12) {
      recs.push({
        category: "Anemia Risk",
        severity: "concern",
        message: `Your hemoglobin level (${data.hemoglobin} g/dL) is below normal range (12-16 g/dL).`,
        action: [
          "Increase iron-rich foods: spinach, beans, red meat",
          "Include vitamin C to enhance iron absorption",
          "Consider iron supplements after consulting doctor",
          "Avoid tea/coffee with meals (reduces iron absorption)"
        ],
        icon: "🩸"
      })
    } else if (data.hemoglobin >= 12 && data.hemoglobin <= 16) {
      recs.push({
        category: "Hemoglobin Status",
        severity: "normal",
        message: `Excellent! Your hemoglobin (${data.hemoglobin} g/dL) is within healthy range.`,
        action: ["Maintain current diet with iron-rich foods"],
        icon: "✅"
      })
    }

    // Cholesterol Analysis
    if (data.totalCholesterol > 200) {
      recs.push({
        category: "Cholesterol Management",
        severity: "attention",
        message: `Total cholesterol (${data.totalCholesterol} mg/dL) is elevated. Optimal is below 200 mg/dL.`,
        action: [
          "Reduce saturated fats and trans fats",
          "Increase soluble fiber (oats, legumes)",
          "Exercise regularly (30 min daily)",
          "Include omega-3 rich foods (fish, walnuts)"
        ],
        icon: "❤️"
      })
    }

    if (data.ldl > 130) {
      recs.push({
        category: "LDL Cholesterol (Bad Cholesterol)",
        severity: "concern",
        message: `LDL cholesterol (${data.ldl} mg/dL) is high. Target is below 100 mg/dL.`,
        action: [
          "Limit red meat and full-fat dairy",
          "Choose healthy fats (olive oil, nuts)",
          "Eat more plant-based proteins",
          "Consider statin therapy (consult doctor)"
        ],
        icon: "⚠️"
      })
    }

    if (data.hdl < 40) {
      recs.push({
        category: "HDL Cholesterol (Good Cholesterol)",
        severity: "attention",
        message: `HDL cholesterol (${data.hdl} mg/dL) is low. Target is above 60 mg/dL.`,
        action: [
          "Regular aerobic exercise",
          "Quit smoking if applicable",
          "Include healthy fats (avocado, olive oil)",
          "Moderate alcohol (if consumed)"
        ],
        icon: "💚"
      })
    }

    // Blood Sugar Analysis
    if (data.fastingGlucose > 100) {
      const severity = data.fastingGlucose > 126 ? "critical" : "attention"
      recs.push({
        category: data.fastingGlucose > 126 ? "Diabetes Risk" : "Pre-Diabetes Warning",
        severity,
        message: `Fasting glucose (${data.fastingGlucose} mg/dL) is ${data.fastingGlucose > 126 ? 'in diabetic range' : 'elevated'}. Normal is below 100 mg/dL.`,
        action: [
          "Limit refined carbs and sugars",
          "Increase fiber intake (whole grains, vegetables)",
          "Regular physical activity (150 min/week)",
          data.fastingGlucose > 126 ? "URGENT: Consult endocrinologist" : "Monitor blood sugar regularly",
          "Maintain healthy weight"
        ],
        icon: data.fastingGlucose > 126 ? "🚨" : "⚡"
      })
    }

    if (data.hba1c > 5.7) {
      recs.push({
        category: "HbA1c (3-month avg blood sugar)",
        severity: data.hba1c > 6.5 ? "critical" : "attention",
        message: `HbA1c (${data.hba1c}%) indicates ${data.hba1c > 6.5 ? 'diabetes' : 'pre-diabetes'}. Target is below 5.7%.`,
        action: [
          "Follow low glycemic index diet",
          "Regular glucose monitoring",
          "Weight management crucial",
          "Consult diabetes specialist"
        ],
        icon: "📊"
      })
    }

    // Liver Function
    if (data.sgpt > 40 || data.sgot > 40) {
      recs.push({
        category: "Liver Health",
        severity: "attention",
        message: `Liver enzymes are elevated (SGPT: ${data.sgpt}, SGOT: ${data.sgot}). Normal is below 40 U/L.`,
        action: [
          "Avoid alcohol completely",
          "Reduce fatty/fried foods",
          "Increase antioxidants (green tea, berries)",
          "Maintain healthy weight",
          "Consult hepatologist if persistently high"
        ],
        icon: "🫀"
      })
    }

    // Kidney Function
    if (data.creatinine > 1.2) {
      recs.push({
        category: "Kidney Function",
        severity: "attention",
        message: `Creatinine (${data.creatinine} mg/dL) is slightly elevated. Normal is 0.6-1.2 mg/dL.`,
        action: [
          "Stay well hydrated (2-3 liters water daily)",
          "Limit protein if advised by doctor",
          "Control blood pressure",
          "Avoid NSAIDs (painkillers)",
          "Regular kidney function monitoring"
        ],
        icon: "💧"
      })
    }

    // Thyroid
    if (data.tsh < 0.4 || data.tsh > 4.5) {
      recs.push({
        category: "Thyroid Function",
        severity: "attention",
        message: `TSH (${data.tsh} mIU/L) is ${data.tsh < 0.4 ? 'low (hyperthyroid)' : 'high (hypothyroid)'}. Normal is 0.4-4.5 mIU/L.`,
        action: [
          data.tsh < 0.4 ? "Reduce iodine intake" : "Include iodized salt",
          "Consult endocrinologist",
          "Regular thyroid monitoring",
          "Medication may be required"
        ],
        icon: "🦋"
      })
    }

    // Vitamin D
    if (data.vitaminD < 30) {
      recs.push({
        category: "Vitamin D Deficiency",
        severity: "attention",
        message: `Vitamin D (${data.vitaminD} ng/mL) is low. Optimal is 30-50 ng/mL.`,
        action: [
          "Sun exposure: 15-20 min daily (morning sun)",
          "Vitamin D rich foods: fatty fish, egg yolks, fortified milk",
          "Consider D3 supplements (1000-2000 IU daily)",
          "Retest after 3 months"
        ],
        icon: "☀️"
      })
    }

    // Vitamin B12
    if (data.vitaminB12 < 200) {
      recs.push({
        category: "Vitamin B12 Deficiency",
        severity: "attention",
        message: `Vitamin B12 (${data.vitaminB12} pg/mL) is low. Normal is 200-900 pg/mL.`,
        action: [
          "Include B12 sources: eggs, dairy, meat, fish",
          "For vegetarians: fortified cereals, nutritional yeast",
          "B12 supplements or injections may be needed",
          "Monitor for symptoms: fatigue, tingling"
        ],
        icon: "💊"
      })
    }

    // Uric Acid
    if (data.uricAcid > 7) {
      recs.push({
        category: "Uric Acid (Gout Risk)",
        severity: "attention",
        message: `Uric acid (${data.uricAcid} mg/dL) is elevated. Normal is 3.5-7.0 mg/dL.`,
        action: [
          "Limit purine-rich foods: red meat, organ meats, shellfish",
          "Avoid alcohol, especially beer",
          "Increase water intake",
          "Include cherries, coffee (may help)",
          "Maintain healthy weight"
        ],
        icon: "🦴"
      })
    }

    // Overall Health Summary
    if (recs.length === 0 || recs.every(r => r.severity === "normal")) {
      recs.push({
        category: "Overall Health Status",
        severity: "normal",
        message: "Congratulations! Your blood test parameters are within healthy ranges.",
        action: [
          "Maintain balanced diet",
          "Continue regular exercise",
          "Annual health checkups",
          "Stay hydrated and manage stress"
        ],
        icon: "🎉"
      })
    }

    return recs
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "normal": return "text-green-400 bg-green-400/10 border-green-400/30"
      case "attention": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      case "concern": return "text-orange-400 bg-orange-400/10 border-orange-400/30"
      case "critical": return "text-red-400 bg-red-400/10 border-red-400/30"
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/30"
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
        {/* Header */}
        <header className="flex justify-between items-center py-4 sm:py-5 mb-6 sm:mb-8 border-b border-white/10">
          <Link href="/" className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] flex items-center gap-2 sm:gap-3 no-underline">
            <i className="fas fa-leaf"></i>
            VitalSync
          </Link>

          <div className="hidden md:flex gap-5">
            <Link href="/dashboard" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Dashboard</Link>
            <Link href="/workout" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Workouts</Link>
            <Link href="/health" className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10">Health</Link>
            <Link href="/blood-test" className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-2 rounded-lg">Blood Test</Link>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white text-xl p-2 rounded-lg hover:bg-white/10">
            <i className={`fas ${showMobileMenu ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </header>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <span>🩺</span> Blood Test Analysis
          </h1>
          <p className="text-[#94a3b8] text-lg">AI-powered personalized health recommendations based on your blood test parameters</p>
        </div>

        {/* AI Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-brain text-2xl text-purple-400"></i>
            <h3 className="text-xl font-bold">Unique AI Health Intelligence</h3>
          </div>
          <p className="text-sm text-[#94a3b8]">
            VitalSync uses advanced AI to analyze your blood test results and generate personalized diet and fitness plans. 
            This unique feature combines medical data with lifestyle factors for truly customized health recommendations.
          </p>
        </div>

        {!bloodTestData ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🧪</div>
            <h2 className="text-2xl font-bold mb-4">Upload Your Blood Test Results</h2>
            <p className="text-[#94a3b8] mb-8 max-w-xl mx-auto">
              Enter your latest blood test values to receive AI-powered health insights and personalized recommendations
            </p>
            <button
              onClick={() => setShowInputModal(true)}
              className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
            >
              <i className="fas fa-upload mr-2"></i>
              Enter Blood Test Data
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowInputModal(true)}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <i className="fas fa-edit mr-2"></i>
                Update Results
              </button>
            </div>

            {/* AI Recommendations */}
            <div>
              <h2 className="text-2xl font-bold mb-6">AI-Generated Recommendations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`border-2 rounded-2xl p-6 ${getSeverityColor(rec.severity)}`}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-3xl">{rec.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{rec.category}</h3>
                        <p className="text-sm mb-4">{rec.message}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-sm">Action Steps:</h4>
                      <ul className="space-y-2">
                        {rec.action.map((action, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-[#4ade80]">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Modal */}
        {showInputModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white/95 text-gray-800 rounded-2xl p-8 max-w-4xl w-full my-8">
              <h2 className="text-3xl font-bold mb-6">Enter Blood Test Results</h2>
              
              {!isAnalyzing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Hemoglobin (g/dL)</label>
                      <input type="number" step="0.1" value={formData.hemoglobin} onChange={(e) => setFormData({...formData, hemoglobin: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">WBC (cells/µL)</label>
                      <input type="number" value={formData.wbc} onChange={(e) => setFormData({...formData, wbc: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Platelets</label>
                      <input type="number" value={formData.platelets} onChange={(e) => setFormData({...formData, platelets: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Cholesterol (mg/dL)</label>
                      <input type="number" value={formData.totalCholesterol} onChange={(e) => setFormData({...formData, totalCholesterol: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">LDL (mg/dL)</label>
                      <input type="number" value={formData.ldl} onChange={(e) => setFormData({...formData, ldl: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">HDL (mg/dL)</label>
                      <input type="number" value={formData.hdl} onChange={(e) => setFormData({...formData, hdl: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Triglycerides (mg/dL)</label>
                      <input type="number" value={formData.triglycerides} onChange={(e) => setFormData({...formData, triglycerides: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fasting Glucose (mg/dL)</label>
                      <input type="number" value={formData.fastingGlucose} onChange={(e) => setFormData({...formData, fastingGlucose: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">HbA1c (%)</label>
                      <input type="number" step="0.1" value={formData.hba1c} onChange={(e) => setFormData({...formData, hba1c: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">SGPT (U/L)</label>
                      <input type="number" value={formData.sgpt} onChange={(e) => setFormData({...formData, sgpt: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">SGOT (U/L)</label>
                      <input type="number" value={formData.sgot} onChange={(e) => setFormData({...formData, sgot: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Creatinine (mg/dL)</label>
                      <input type="number" step="0.1" value={formData.creatinine} onChange={(e) => setFormData({...formData, creatinine: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">TSH (mIU/L)</label>
                      <input type="number" step="0.1" value={formData.tsh} onChange={(e) => setFormData({...formData, tsh: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Vitamin D (ng/mL)</label>
                      <input type="number" value={formData.vitaminD} onChange={(e) => setFormData({...formData, vitaminD: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Vitamin B12 (pg/mL)</label>
                      <input type="number" value={formData.vitaminB12} onChange={(e) => setFormData({...formData, vitaminB12: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Uric Acid (mg/dL)</label>
                      <input type="number" step="0.1" value={formData.uricAcid} onChange={(e) => setFormData({...formData, uricAcid: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setShowInputModal(false)} className="flex-1 bg-gray-200 py-3 rounded-lg font-semibold">Cancel</button>
                    <button onClick={analyzeBloodTest} className="flex-1 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white py-3 rounded-lg font-bold">
                      <i className="fas fa-brain mr-2"></i>
                      Analyze with AI
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <div className="text-center mb-8">
                    <div className="animate-spin text-6xl mb-4">🧠</div>
                    <h3 className="text-2xl font-bold mb-2">AI is Analyzing Your Blood Test...</h3>
                    <p className="text-gray-600 mb-6">Generating personalized health recommendations</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-4 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">{Math.round(analysisProgress)}% Complete</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
