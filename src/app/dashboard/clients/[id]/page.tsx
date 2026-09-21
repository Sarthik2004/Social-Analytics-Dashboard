import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import SocialAccount from "@/models/SocialAccount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const runtime = "nodejs";

interface Props {
  params: Promise<{ id: string }>;
}

const platforms = [
  { id: "instagram", name: "Instagram", color: "bg-pink-500" },
  { id: "facebook", name: "Facebook", color: "bg-blue-600" },
  { id: "twitter", name: "X (Twitter)", color: "bg-black" },
  { id: "linkedin", name: "LinkedIn", color: "bg-sky-700" },
  { id: "tiktok", name: "TikTok", color: "bg-gray-900" },
  { id: "youtube", name: "YouTube", color: "bg-red-600" },
];

export default async function ClientDetailPage({ params }: Props) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {(client as any).name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage connected social accounts
          </p>
        </div>
        <Link href="/dashboard/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {accounts.length}
          </CardContent>
        </Card>
      </div>

      {/* Connected accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">
              No social accounts connected yet.
            </p>
          ) : (
            accounts.map((acc: any) => (
              <div
                key={acc._id.toString()}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">@{acc.username}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {acc.platform}
                  </p>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Connect new platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {platforms.map((p) => (
              <form key={p.id} action={`/api/social/connect`} method="post">
                <input type="hidden" name="clientId" value={id} />
                <input type="hidden" name="platform" value={p.id} />
                <Button type="submit" variant="outline" className="w-full justify-start gap-3">
                  <span className={`h-3 w-3 rounded-full ${p.color}`} />
                  Connect {p.name}
                </Button>
              </form>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Note: For now this saves a demo connected account. Real OAuth can be added next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}