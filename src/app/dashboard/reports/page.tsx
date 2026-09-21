import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";

export const runtime = "nodejs";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await dbConnect();

  const clients = await Client.find({
    agencyId: (session.user as any).id,
  })
    .sort({ name: 1 })
    .lean();

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate monthly client reports for {currentMonth}
        </p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No clients found. Add a client first to generate reports.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client: any) => (
            <Card key={client._id.toString()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {client.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Monthly performance summary
                </p>
                <Link href={`/dashboard/reports/${client._id}`}>
                  <Button className="w-full">View Report</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}