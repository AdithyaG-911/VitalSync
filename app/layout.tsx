import type React from "react"
import ClientLayout from "./ClientLayout" // Corrected import to use default export
import "./globals.css"

export const metadata = {
  title: "VitalSync - Your Personal Health & Wellness Companion",
  description: "Track your workouts, nutrition, sleep, and overall health. Achieve your wellness goals with VitalSync's comprehensive health monitoring platform.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
