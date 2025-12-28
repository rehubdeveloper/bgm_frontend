"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Building,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Mic,
  UserPlus,
  Clock
} from "lucide-react"

interface DashboardStats {
  totalMembers: {
    count: number
    label: string
    change: string
  }
  pendingTestimonies: {
    count: number
    label: string
    change: string
  }
  activeEvents: {
    count: number
    label: string
    change: string
  }
  recentContent: {
    count: number
    label: string
    change: string
  }
  totalDepartments: {
    count: number
    label: string
    change: string
  }
  detailedStats: {
    totalSermons: number
    totalDevotionals: number
    totalTestimonies: number
    recentMembersCount: number
    recentSermonsCount: number
    recentDevotionalsCount: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-event':
        router.push('/admin/events?action=create')
        break
      case 'add-devotional':
        router.push('/admin/devotionals?action=create')
        break
      case 'upload-sermon':
        router.push('/admin/sermons?action=create')
        break
      case 'add-testimony':
        router.push('/admin/testimonies?action=create')
        break
      case 'add-member':
        router.push('/admin/members?action=create')
        break
      default:
        break
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const statCards = stats ? [
    {
      ...stats.totalMembers,
      icon: Users,
      color: "text-blue-600"
    },
    {
      ...stats.pendingTestimonies,
      icon: MessageSquare,
      color: "text-orange-600"
    },
    {
      ...stats.activeEvents,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      ...stats.recentContent,
      icon: FileText,
      color: "text-purple-600"
    },
    {
      ...stats.totalDepartments,
      icon: Building,
      color: "text-indigo-600"
    }
  ] : []

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Believers Glorious Ministry admin panel</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Believers Glorious Ministry admin panel</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardStats}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Believers Glorious Ministry admin panel</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardStats}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-6 glass-card border-2 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground mt-2">{stat.count.toLocaleString()}</p>
                <p className="text-sm text-primary mt-2">{stat.change}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 glass-card border-2 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Content Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Total Sermons</span>
              </div>
              <span className="text-2xl font-bold">{stats?.detailedStats.totalSermons || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="font-medium">Total Devotionals</span>
              </div>
              <span className="text-2xl font-bold">{stats?.detailedStats.totalDevotionals || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Total Testimonies</span>
              </div>
              <span className="text-2xl font-bold">{stats?.detailedStats.totalTestimonies || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-2 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity (30 days)
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="font-medium">New Members</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">+{stats?.detailedStats.recentMembersCount || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-purple-600" />
                <span className="font-medium">New Sermons</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">+{stats?.detailedStats.recentSermonsCount || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="font-medium">New Devotionals</span>
              </div>
              <span className="text-2xl font-bold text-green-600">+{stats?.detailedStats.recentDevotionalsCount || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 glass-card border-2 border-primary/20">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => handleQuickAction('add-event')}
            className="btn-primary flex items-center gap-2 h-auto py-3"
          >
            <Calendar className="w-4 h-4" />
            Add Event
          </Button>
          <Button
            onClick={() => handleQuickAction('add-devotional')}
            className="btn-primary flex items-center gap-2 h-auto py-3"
          >
            <BookOpen className="w-4 h-4" />
            Add Devotional
          </Button>
          <Button
            onClick={() => handleQuickAction('upload-sermon')}
            className="btn-primary flex items-center gap-2 h-auto py-3"
          >
            <Mic className="w-4 h-4" />
            Upload Sermon
          </Button>
          <Button
            onClick={() => handleQuickAction('add-member')}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3"
          >
            <Users className="w-4 h-4" />
            Add Member
          </Button>
        </div>
      </Card>
    </div>
  )
}
