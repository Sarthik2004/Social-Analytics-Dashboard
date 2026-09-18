import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const clients = await Client.find({
      agencyId: (session.user as any).id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(clients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, logo } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Client name is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const client = await Client.create({
      name: name.trim(),
      logo: logo || "",
      agencyId: (session.user as any).id,
      socialAccounts: [],
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}