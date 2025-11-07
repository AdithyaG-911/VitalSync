"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SleepRecord {
  date: string
  bedtime: string
  wakeTime: string
  duration: number
  quality: number
  notes?: string
}

export default function SleepPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [sleepForm, setSleepForm] = useState({
    bedtime: "",
    wakeTime: "",
    quality: 5,
    notes: "",
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
      loadSleepData(userData.userId)
    } catch (e) {
      console.error("Error loading user data", e)
      router.push("/auth")
    }
  }, [router])

  const loadSleepData = (userId: string) => {
    const savedData = localStorage.getItem(`sleepData_${userId}`)
    if (savedData) {
      const data = JSON.parse(savedData)
      setSleepRecords(data.sleepRecords || [])
    }
  }

  const saveSleepData = (records: SleepRecord[]) => {
    if (currentUser?.userId) {
      const data = {
        sleepRecords: records,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(`sleepData_${currentUser.userId}`, JSON.stringify(data))
    }
  }

  const calculateDuration = (bedtime: string, wakeTime: string) => {
    const bed = new Date(`2000-01-01 ${bedtime}`)
    let wake = new Date(`2000-01-01 ${wakeTime}`)

    // If wake time is earlier than bedtime, assume it's the next day
    if (wake < bed) {
      wake = new Date(`2000-01-02 ${wakeTime}`)
    }

    const diffMs = wake.getTime() - bed.getTime()
    return diffMs / (1000 * 60 * 60) // Convert to hours
  }

  const addSleepRecord = () => {
    if (!sleepForm.bedtime || !sleepForm.wakeTime) return

    const duration = calculateDuration(sleepForm.bedtime, sleepForm.wakeTime)
    const newRecord: SleepRecord = {
      date: new Date().toDateString(),
      bedtime: sleepForm.bedtime,
      wakeTime: sleepForm.wakeTime,
      duration: Math.round(duration * 10) / 10,
      quality: sleepForm.quality,
      notes: sleepForm.notes,
    }

    const updatedRecords = [newRecord, ...sleepRecords]
    setSleepRecords(updatedRecords)
    saveSleepData(updatedRecords)

    // Reset form
    setSleepForm({
      bedtime: "",
      wakeTime: "",
      quality: 5,
      notes: "",
    })
    setShowSleepModal(false)
  }

  const getAverageSleep = () => {
    if (sleepRecords.length === 0) return "0h 0m"
    const totalHours = sleepRecords.reduce((sum, record) => sum + record.duration, 0)
    const avgHours = totalHours / sleepRecords.length
    const hours = Math.floor(avgHours)
    const minutes = Math.round((avgHours - hours) * 60)
    return `${hours}h ${minutes}m`
  }

  const getAverageQuality = () => {
    if (sleepRecords.length === 0) return 0
    const total = sleepRecords.reduce((sum, record) => sum + record.quality, 0)
    return Math.round((total / sleepRecords.length) * 10) / 10
  }

  const getSleepTrend = () => {
    if (sleepRecords.length < 2) return "stable"
    const recent = sleepRecords.slice(0, 3)
    const older = sleepRecords.slice(3, 6)

    if (recent.length === 0 || older.length === 0) return "stable"

    const recentAvg = recent.reduce((sum, r) => sum + r.duration, 0) / recent.length
    const olderAvg = older.reduce((sum, r) => sum + r.duration, 0) / older.length

    if (recentAvg > olderAvg + 0.5) return "improving"
    if (recentAvg < olderAvg - 0.5) return "declining"
    return "stable"
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return "text-[#4ade80]"
    if (quality >= 6) return "text-yellow-400"
    if (quality >= 4) return "text-orange-400"
    return "text-red-400"
  }

  const getQualityText = (quality: number) => {
    if (quality >= 8) return "Excellent"
    if (quality >= 6) return "Good"
    if (quality >= 4) return "Fair"
    return "Poor"
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
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10"
            >
              Hydration
            </Link>
            <Link
              href="/sleep"
              className="text-[#94a3b8] no-underline font-medium px-4 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10 text-[#4ade80] bg-white/10"
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
                className="text-[#94a3b8] no-underline font-medium px-4 py-3 rounded-lg transition-all hover:text-white hover:bg-white/10"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-tint mr-2"></i> Hydration
              </Link>
              <Link
                href="/sleep"
                className="text-[#4ade80] bg-white/10 no-underline font-medium px-4 py-3 rounded-lg transition-all"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#4ade80]">Sleep Analysis</h2>
                <button
                  onClick={() => setShowSleepModal(true)}
                  className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Log Sleep
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-[#4ade80] mb-2">{getAverageSleep()}</div>
                  <div className="text-sm text-[#94a3b8]">Average Sleep</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-[#4ade80] mb-2">{getAverageQuality()}/10</div>
                  <div className="text-sm text-[#94a3b8]">Sleep Quality</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-[#4ade80] mb-2">{sleepRecords.length}</div>
                  <div className="text-sm text-[#94a3b8]">Records</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] p-6 rounded-xl mb-6 relative overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_70%)]" />
                <h3 className="text-xl font-bold mb-2 relative">Sleep Insights</h3>
                <p className="text-white/90 relative">
                  {getSleepTrend() === "improving" && "Your sleep duration is improving! Keep up the good work."}
                  {getSleepTrend() === "declining" &&
                    "Your sleep duration has been declining. Consider improving your sleep hygiene."}
                  {getSleepTrend() === "stable" && "Your sleep patterns are stable. Maintain your current routine."}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Sleep History</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sleepRecords.length > 0 ? (
                  sleepRecords.map((record, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{record.date}</div>
                        <div className={`font-bold ${getQualityColor(record.quality)}`}>
                          {getQualityText(record.quality)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-[#94a3b8]">Bedtime:</span>
                          <div className="font-medium">{record.bedtime}</div>
                        </div>
                        <div>
                          <span className="text-[#94a3b8]">Wake Time:</span>
                          <div className="font-medium">{record.wakeTime}</div>
                        </div>
                        <div>
                          <span className="text-[#94a3b8]">Duration:</span>
                          <div className="font-medium">{record.duration}h</div>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-[#94a3b8]">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[#94a3b8] text-center py-8">No sleep records yet. Start logging your sleep!</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Sleep Patterns</h3>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-moon text-[#4ade80]"></i>
                    <span className="font-medium">Optimal Sleep</span>
                  </div>
                  <p className="text-sm text-[#94a3b8]">
                    Adults need 7-9 hours of quality sleep per night for optimal health and performance.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-clock text-[#4ade80]"></i>
                    <span className="font-medium">Consistency</span>
                  </div>
                  <p className="text-sm text-[#94a3b8]">
                    Going to bed and waking up at the same time daily helps regulate your circadian rhythm.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-bed text-[#4ade80]"></i>
                    <span className="font-medium">Sleep Quality</span>
                  </div>
                  <p className="text-sm text-[#94a3b8]">
                    Quality matters as much as quantity. Deep, uninterrupted sleep is most restorative.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Sleep Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Digital Detox</p>
                    <p className="text-[#94a3b8]">Avoid screens 1 hour before bedtime to improve sleep quality.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-thermometer-half"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Cool Environment</p>
                    <p className="text-[#94a3b8]">Keep your bedroom between 60-67°F (15-19°C) for optimal sleep.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-coffee"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Caffeine Cutoff</p>
                    <p className="text-[#94a3b8]">Avoid caffeine 6 hours before bedtime to prevent sleep disruption.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[#4ade80] mt-1">
                    <i className="fas fa-sun"></i>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Morning Light</p>
                    <p className="text-[#94a3b8]">
                      Get natural sunlight exposure in the morning to regulate your sleep cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Logging Modal */}
        {showSleepModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-5">
            <div className="bg-white/95 w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative text-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2d3748]">Log Sleep</h2>
                <button
                  onClick={() => setShowSleepModal(false)}
                  className="bg-none border-none text-2xl cursor-pointer text-[#a0aec0] transition-colors hover:text-[#e53e3e]"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Bedtime</label>
                  <input
                    type="time"
                    value={sleepForm.bedtime}
                    onChange={(e) => setSleepForm({ ...sleepForm, bedtime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Wake Time</label>
                  <input
                    type="time"
                    value={sleepForm.wakeTime}
                    onChange={(e) => setSleepForm({ ...sleepForm, wakeTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Sleep Quality: {sleepForm.quality}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepForm.quality}
                    onChange={(e) => setSleepForm({ ...sleepForm, quality: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Notes (Optional)</label>
                  <textarea
                    value={sleepForm.notes}
                    onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })}
                    placeholder="How did you sleep? Any factors that affected your sleep?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSleepModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={addSleepRecord}
                  disabled={!sleepForm.bedtime || !sleepForm.wakeTime}
                  className="flex-1 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white font-medium py-3 rounded-lg transition-all border-none cursor-pointer transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(74,222,128,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Log Sleep
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
