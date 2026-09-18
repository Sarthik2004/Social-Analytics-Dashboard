import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GrowthChart from "@/components/GrowthChart";
import EngagementChart from "@/components/EngagementChart";
import MetricCard from "@/components/MetricCard";
import { Users, Heart, Eye, TrendingUp } from "lucide-react";

export const runtime = "nodejs";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Demo data (later MongoDB se aayega)
  const growthData = [
    { date: "Mon", followers: 1200 },
    { date: "Tue", followers: 1350 },
    { date: "Wed", followers: 1420 },
    { date: "Thu", followers: 1550 },
    { date: "Fri", followers: 1680 },
    { date: "Sat", followers: 1800 },
    { date: "Sun", followers: 1950 },
  ];

  const engagementData = [
    { date: "Mon", likes: 220, comments: 40, reach: 3200 },
    { date: "Tue", likes: 260, comments: 55, reach: 3600 },
    { date: "Wed", likes: 210, comments: 38, reach: 3000 },
    { date: "Thu", likes: 310, comments: 62, reach: 4100 },
    { date: "Fri", likes: 280, comments: 49, reach: 3900 },
    { date: "Sat", likes: 350, comments: 70, reach: 4500 },
    { date: "Sun", likes: 400, comments: 80, reach: 5000 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Performance overview across your clients
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Followers"
          value="12.4K"
          change={8.2}
          description="vs last week"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Engagement Rate"
          value="4.8%"
          change={0.6}
          description="vs last week"
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Reach"
          value="48.2K"
          change={12.1}
          description="vs last week"
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Growth"
          value="+9.4%"
          change={2.3}
          description="this week"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={growthData} />
        <EngagementChart data={engagementData} />
      </div>
    </div>
  );
}