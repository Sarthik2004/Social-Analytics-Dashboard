import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Users } from "lucide-react";

export const runtime = "nodejs";

export default async function ClientsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await dbConnect();

  const clients = await Client.find({
    agencyId: (session.user as any).id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your agency clients
          </p>
        </div>

        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start tracking social media performance."
          actionLabel="Add Client"
          actionHref="/dashboard/clients/new"
          icon={<Users className="h-10 w-10" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client: any) => (
            <Link
              key={client._id.toString()}
              href={`/dashboard/clients/${client._id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View analytics & connected accounts
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
