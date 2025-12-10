"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, Settings, BarChart3, FileText, MessageSquare, Mic, BookOpen, Calendar, Heart, Users, Mail, Building, Tv } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: BarChart3 },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Testimonies", href: "/admin/testimonies", icon: MessageSquare },
    { label: "Sermons", href: "/admin/sermons", icon: Mic },
    { label: "Devotionals", href: "/admin/devotionals", icon: BookOpen },
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Giving", href: "/admin/giving", icon: Heart },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Departments", href: "/admin/departments", icon: Building },
    { label: "Contact", href: "/admin/contact", icon: Mail },
    { label: "Branches", href: "/admin/branches", icon: Building },
    { label: "Live TV", href: "/admin/live-tv", icon: Tv },
  ]

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col z-10 lg:relative lg:transition-none lg:z-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-display font-bold text-sidebar-foreground">BGM Admin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-5 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="text-sm text-muted-foreground">Welcome back, Admin</div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
