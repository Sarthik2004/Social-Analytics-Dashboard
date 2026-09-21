import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import SocialAccount from "@/models/SocialAccount";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const clientId = form.get("clientId") as string;
    const platform = form.get("platform") as string;

    if (!clientId || !platform) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    await dbConnect();

    // Ensure client belongs to current agency user
    const client = await Client.findOne({
      _id: clientId,
      agencyId: (session.user as any).id,
    });

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    // Demo account (later real OAuth tokens)
    const account = await SocialAccount.create({
      clientId,
      platform,
      platformUserId: `${platform}_demo_${Date.now()}`,
      username: `${platform}_user`,
      displayName: `${platform} Demo Account`,
      accessToken: "demo_token",
      isActive: true,
    });

    // Link to client
    client.socialAccounts.push(account._id);
    await client.save();

    return NextResponse.redirect(
      new URL(`/dashboard/clients/${clientId}`, req.url)
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}