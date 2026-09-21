import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import SocialAccount from "@/models/SocialAccount";
import MetricSnapshot from "@/models/MetricSnapshot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export const runtime = "nodejs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientReportPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  await dbConnect();

  const client = await Client.findOne({
    _id: id,
    agencyId: (session.user as any).id,
  }).lean();

  if (!client) notFound();

  const accounts = await SocialAccount.find({
    clientId: id,
    isActive: true,
  }).lean();

  const accountIds = accounts.map((a: any) => a._id);

  const snapshots = await MetricSnapshot.find({
    socialAccountId: { $in: accountIds },
  })
    .sort({ date: -1 })
    .limit(30)
    .lean();

  const latest = snapshots[0];
  const oldest = snapshots[snapshots.length - 1];

  const followers = latest?.followers ?? 0;
  const likes = latest?.likes ?? 0;
  const comments = latest?.comments ?? 0;
  const reach = latest?.reach ?? 0;
  const engagementRate = latest?.engagementRate ?? 0;

  const growth =
    latest && oldest && oldest.followers
      ? (((latest.followers - oldest.followers) / oldest.followers) * 100).toFixed(1)
      : "0.0";

  const monthLabel = format(new Date(), "MMMM yyyy");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {(client as any).name} Report
          </h1>
          <p className="text-muted-foreground mt-1">{monthLabel} performance summary</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/reports">
            <Button variant="outline">Back</Button>
          </Link>
          <Button disabled title="PDF export coming next">
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {followers.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{engagementRate}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reach</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {reach.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Growth</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{growth}%</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Likes</p>
            <p className="text-xl font-semibold">{likes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comments</p>
            <p className="text-xl font-semibold">{comments.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Connected Accounts</p>
            <p className="text-xl font-semibold">{accounts.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">No social accounts connected.</p>
          ) : (
            accounts.map((acc: any) => (
              <div
                key={acc._id.toString()}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <span className="capitalize font-medium">{acc.platform}</span>
                <span className="text-sm text-muted-foreground">@{acc.username}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}