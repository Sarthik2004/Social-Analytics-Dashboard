import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import SocialAccount from "@/models/SocialAccount";
import MetricSnapshot from "@/models/MetricSnapshot";
import GrowthChart from "@/components/GrowthChart";
import EngagementChart from "@/components/EngagementChart";
import BestPostsTable from "@/components/BestPostsTable";
import MetricCard from "@/components/MetricCard";
import { Users, Heart, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export const runtime = "nodejs";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await dbConnect();

  const clients = await Client.find({
    agencyId: (session.user as any).id,
  }).select("_id");

  const clientIds = clients.map((c) => c._id);

  const accounts = await SocialAccount.find({
    clientId: { $in: clientIds },
    isActive: true,
  }).select("_id");

  const accountIds = accounts.map((a) => a._id);

  const snapshots = await MetricSnapshot.find({
    socialAccountId: { $in: accountIds },
  })
    .sort({ date: 1 })
    .lean();

  // group by date
  const byDate: Record<
    string,
    { followers: number; likes: number; comments: number; reach: number; count: number }
  > = {};

  for (const s of snapshots) {
    const key = format(new Date(s.date), "dd MMM");
    if (!byDate[key]) {
      byDate[key] = { followers: 0, likes: 0, comments: 0, reach: 0, count: 0 };
    }
    byDate[key].followers += s.followers || 0;
    byDate[key].likes += s.likes || 0;
    byDate[key].comments += s.comments || 0;
    byDate[key].reach += s.reach || 0;
    byDate[key].count += 1;
  }

  const growthData = Object.entries(byDate).map(([date, v]) => ({
    date,
    followers: v.followers,
  }));

  const engagementData = Object.entries(byDate).map(([date, v]) => ({
    date,
    likes: v.likes,
    comments: v.comments,
    reach: v.reach,
  }));

  const latest = snapshots[snapshots.length - 1];
  const totalFollowers = latest?.followers ?? 0;
  const engRate = latest?.engagementRate ?? 0;
  const totalReach = latest?.reach ?? 0;

  // temporary best posts demo (next me Post model se)
  const bestPosts = [
    {
      id: "1",
      content: "Top performing campaign post",
      platform: "Instagram",
      likes: 2450,
      comments: 180,
      reach: 32000,
      engagementRate: 8.2,
      type: "image",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Real metrics from connected accounts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Followers"
          value={totalFollowers.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${engRate}%`}
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Reach"
          value={totalReach.toLocaleString()}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Accounts"
          value={accounts.length}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={growthData} />
        <EngagementChart data={engagementData} />
      </div>

      <BestPostsTable posts={bestPosts} />
    </div>
  );
}