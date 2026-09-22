import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import SocialAccount from "@/models/SocialAccount";
import MetricSnapshot from "@/models/MetricSnapshot";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();

    const client = await Client.findOne({
      _id: id,
      agencyId: (session.user as any).id,
    });

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const accounts = await SocialAccount.find({
      clientId: id,
      isActive: true,
    });

    const accountIds = accounts.map((a) => a._id);

    const snapshots = await MetricSnapshot.find({
      socialAccountId: { $in: accountIds },
    })
      .sort({ date: -1 })
      .limit(30);

    const latest = snapshots[0];
    const oldest = snapshots[snapshots.length - 1];

    const followers = latest?.followers ?? 0;
    const likes = latest?.likes ?? 0;
    const comments = latest?.comments ?? 0;
    const reach = latest?.reach ?? 0;
    const engagementRate = latest?.engagementRate ?? 0;

    const growth =
      latest && oldest && oldest.followers
        ? Number(
            (
              ((latest.followers - oldest.followers) / oldest.followers) *
              100
            ).toFixed(1)
          )
        : 0;

    const monthLabel = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Create PDF
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("SocialPulse Monthly Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Client: ${client.name}`, 14, 30);
    doc.text(`Period: ${monthLabel}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [["Metric", "Value"]],
      body: [
        ["Followers", followers.toLocaleString()],
        ["Engagement Rate", `${engagementRate}%`],
        ["Reach", reach.toLocaleString()],
        ["Likes", likes.toLocaleString()],
        ["Comments", comments.toLocaleString()],
        ["Growth", `${growth}%`],
        ["Connected Accounts", String(accounts.length)],
      ],
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;

    doc.text("Connected Platforms", 14, finalY + 15);

    const platformRows =
      accounts.length > 0
        ? accounts.map((a) => [a.platform, `@${a.username}`])
        : [["No accounts", "-"]];

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Platform", "Username"]],
      body: platformRows,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${client.name.replace(
          /\s+/g,
          "_"
        )}_report.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 });
  }
}