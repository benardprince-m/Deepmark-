"use client";

import { useState } from "react";
import { Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const stats = [
  { label: "Posts Planned", value: "12", icon: Clock, trend: "+3 this week" },
  { label: "In Progress", value: "4", icon: TrendingUp, trend: "On track" },
  { label: "Published", value: "28", icon: CheckCircle, trend: "+8 this week" },
];

export default function DashboardPage() {
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here&apos;s your marketing overview"
        action={
          <Button onClick={() => setIsNewPostOpen(true)}>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-xs text-[#10B981]">{stat.trend}</p>
                  </div>
                  <div className="rounded-full bg-[#1F2937] p-3">
                    <Icon className="h-6 w-6 text-[#7C3AED]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* This Week's Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>This Week&apos;s Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { task: "Create Twitter thread about product launch", status: "todo", day: "Today" },
              { task: "Review LinkedIn post draft", status: "in_progress", day: "Today" },
              { task: "Schedule Instagram carousel", status: "todo", day: "Tomorrow" },
              { task: "Write newsletter intro", status: "done", day: "Yesterday" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-[#374151] p-4">
                <div className={`h-2 w-2 rounded-full ${
                  item.status === "done" ? "bg-[#10B981]" :
                  item.status === "in_progress" ? "bg-[#7C3AED]" : "bg-[#6B7280]"
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${item.status === "done" ? "text-[#6B7280] line-through" : "text-white"}`}>
                    {item.task}
                  </p>
                </div>
                <span className="text-xs text-[#6B7280]">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer transition-colors hover:border-[#7C3AED]">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-[#7C3AED]/20 p-3">
              <Plus className="h-6 w-6 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="font-medium text-white">Create Campaign</h3>
              <p className="text-sm text-[#6B7280]">Start a new marketing campaign</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-[#7C3AED]">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-[#10B981]/20 p-3">
              <TrendingUp className="h-6 w-6 text-[#10B981]" />
            </div>
            <div>
              <h3 className="font-medium text-white">View Analytics</h3>
              <p className="text-sm text-[#6B7280]">See how your content is performing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Post Modal */}
      <Modal isOpen={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} title="Create New Post">
        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Platform</label>
            <Select options={[
              { value: "twitter", label: "Twitter" },
              { value: "linkedin", label: "LinkedIn" },
            ]} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Content</label>
            <Textarea placeholder="What do you want to share?" rows={4} />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsNewPostOpen(false)}>Cancel</Button>
            <Button>Create Post</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
