import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import MetricCard from "@/components/MetricCard";
import GrowthChart from "@/components/GrowthChart";
import { Users, Eye, Heart, TrendingUp } from "lucide-react";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();
  await dbConnect();

  const clients = await Client.find({
    agencyId: (session?.user as any)?.id,
  }).lean();

  const chartData = [
    { date: "Jan", followers: 12400 },
    { date: "Feb", followers: 13800 },
    { date: "Mar", followers: 15200 },
    { date: "Apr", followers: 17100 },
    { date: "May", followers: 18900 },
    { date: "Jun", followers: 21400 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all client performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Clients"
          value={clients.length}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Followers"
          value="128.4K"
          change={12.5}
          description="vs last month"
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Avg. Engagement"
          value="4.8%"
          change={0.6}
          description="vs last month"
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Growth Rate"
          value="+18.2%"
          change={3.1}
          description="this quarter"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthChart data={chartData} />
        </div>
      </div>
    </div>
  );
}