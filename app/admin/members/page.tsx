"use client"

import { Card } from "@/components/ui/card"
import { Download, Eye, Trash2 } from "lucide-react"
import { useState } from "react"

const members = [
  {
    id: 1,
    name: "Chinedu Obi",
    email: "chinedu@email.com",
    phone: "08012345678",
    status: "Verified",
    joined: "2024-12-15",
  },
  {
    id: 2,
    name: "Amara Chioma",
    email: "amara@email.com",
    phone: "08098765432",
    status: "Pending",
    joined: "2025-01-10",
  },
  {
    id: 3,
    name: "Emeka David",
    email: "emeka@email.com",
    phone: "08156789012",
    status: "Verified",
    joined: "2024-11-20",
  },
]

export default function MembersManagement() {
  const [members_list, setMembers] = useState(members)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground">View and manage membership applications and records</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Total Members</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">1,234</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Pending Review</p>
          <p className="text-3xl font-display font-bold text-accent mt-2">12</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">This Month</p>
          <p className="text-3xl font-display font-bold text-primary mt-2">45</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Active Departments</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">8</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 glass-card border-2 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Statuses</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Branches</option>
            <option>Lagos</option>
            <option>Abuja</option>
            <option>Portharcourt</option>
          </select>
          <button className="btn-primary">Filter</button>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="p-6 glass-card border-2 border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members_list.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4 text-sm text-foreground font-medium">{member.name}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{member.email}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{member.phone}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${member.status === "Verified" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{member.joined}</td>
                  <td className="px-4 py-4 flex items-center justify-center gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-primary" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
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
