import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono, Plus_Jakarta_Sans, ADLaM_Display as Clash_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
})
const _clashDisplay = Clash_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"], // Updated to only include the available weight
})

export const metadata: Metadata = {
  title: "Believers Glorious Ministry - Church Platform",
  description:
    "Connect, worship, and grow with Believers Glorious Ministry. Access sermons, live streams, testimonies, and more.",
  icons: {
    icon: [
      {
        url: "/BGM.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/BMG.png",
        media: "(prefers-color-scheme: dark)",
      }
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
