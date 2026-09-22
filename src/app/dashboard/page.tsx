import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import SocialAccount from "@/models/SocialAccount";
import MetricSnapshot from "@/models/MetricSnapshot";
import MetricCard from "@/components/MetricCard";
import GrowthChart from "@/components/GrowthChart";
import EmptyState from "@/components/EmptyState";
import { Users, Share2, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await dbConnect();

  const userId = (session.user as any).id;

  const clients = await Client.find({ agencyId: userId }).lean();
  const clientIds = clients.map((c) => c._id);

  const accounts = await SocialAccount.find({
    clientId: { $in: clientIds },
    isActive: true,
  }).lean();

  const accountIds = accounts.map((a) => a._id);

  const snapshots = await MetricSnapshot.find({
    socialAccountId: { $in: accountIds },
  })
    .sort({ date: 1 })
    .lean();

  const byDate: Record<string, number> = {};
  for (const s of snapshots) {
    const key = format(new Date(s.date), "dd MMM");
    byDate[key] = (byDate[key] || 0) + (s.followers || 0);
  }

  const growthData = Object.entries(byDate).map(([date, followers]) => ({
    date,
    followers,
  }));

  const latest = snapshots[snapshots.length - 1];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user?.name}
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button>Add Client</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Clients"
          value={clients.length}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Connected Accounts"
          value={accounts.length}
          icon={<Share2 className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Followers"
          value={(latest?.followers ?? 0).toLocaleString()}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Engagement"
          value={`${latest?.engagementRate ?? 0}%`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="Start by adding a client"
          description="Create a client, connect social accounts, then view analytics and monthly reports."
          actionLabel="Add Client"
          actionHref="/dashboard/clients/new"
          icon={<Users className="h-10 w-10" />}
        />
      ) : growthData.length === 0 ? (
        <EmptyState
          title="No metrics yet"
          description="Connect social accounts and seed metrics to see growth charts."
          actionLabel="View Clients"
          actionHref="/dashboard/clients"
        />
      ) : (
        <GrowthChart data={growthData} />
      )}
    </div>
  );
}