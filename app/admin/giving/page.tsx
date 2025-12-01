"use client"

import { Card } from "@/components/ui/card"
import { Download, TrendingUp } from "lucide-react"

const donations = [
  { id: 1, name: "Seun Adebayo", amount: "₦50,000", type: "One-time", date: "2025-01-18", status: "Completed" },
  { id: 2, name: "Folake Okonkwo", amount: "₦10,000", type: "Monthly", date: "2025-01-15", status: "Completed" },
  { id: 3, name: "Tunde Bello", amount: "₦100,000", type: "Project", date: "2025-01-10", status: "Completed" },
]

export default function GivingManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Giving & Donations</h1>
          <p className="text-muted-foreground">Manage donations, partnerships, and giving analytics</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Total Given (This Year)</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">₦2.5M</p>
          <p className="text-sm text-primary mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +15%
          </p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Active Partners</p>
          <p className="text-3xl font-display font-bold text-primary mt-2">234</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Monthly Givers</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">67</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Pending Transactions</p>
          <p className="text-3xl font-display font-bold text-accent mt-2">3</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 glass-card border-2 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Types</option>
            <option>One-time</option>
            <option>Monthly</option>
            <option>Project</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="btn-primary">Filter</button>
        </div>
      </Card>

      {/* Donations Table */}
      <Card className="p-6 glass-card border-2 border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Donor Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4 text-sm text-foreground font-medium">{donation.name}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary">{donation.amount}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{donation.type}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{donation.date}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {donation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
