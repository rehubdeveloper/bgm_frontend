"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const dashboardData = [
  { month: "Jan", donations: 4000, members: 240 },
  { month: "Feb", donations: 3000, members: 221 },
  { month: "Mar", donations: 2000, members: 229 },
  { month: "Apr", donations: 2780, members: 200 },
  { month: "May", donations: 1890, members: 250 },
  { month: "Jun", donations: 2390, members: 290 },
]

const stats = [
  { label: "Total Members", value: "1,234", change: "+12%" },
  { label: "Total Donations", value: "₦2.5M", change: "+8%" },
  { label: "Active Events", value: "5", change: "2 upcoming" },
  { label: "Pending Testimonies", value: "8", change: "Awaiting review" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Believers Glorious Ministry admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 glass-card border-2 border-primary/20">
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-foreground mt-2">{stat.value}</p>
            <p className="text-sm text-primary mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 glass-card border-2 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">Donations Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="donations" stroke="var(--primary)" name="Donations (₦)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 glass-card border-2 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">Members Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip />
              <Legend />
              <Bar dataKey="members" fill="var(--primary)" name="New Members" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 glass-card border-2 border-primary/20">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-primary">Add Event</button>
          <button className="btn-primary">Add Devotional</button>
          <button className="btn-primary">Upload Sermon</button>
          <button className="btn-outline">View Reports</button>
        </div>
      </Card>
    </div>
  )
}
