import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boundaries = await prisma.boundary.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boundaries);
  } catch (error) {
    console.error("Error fetching boundaries:", error);
    return NextResponse.json({ error: "Failed to fetch boundaries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const boundary = await prisma.boundary.create({
      data: {
        name: body.name,
        coords: body.coords,
        color: body.color ?? "#3388ff",
      },
    });
    return NextResponse.json(boundary, { status: 201 });
  } catch (error) {
    console.error("Error creating boundary:", error);
    return NextResponse.json({ error: "Failed to create boundary" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Boundary ID required" }, { status: 400 });
    }

    await prisma.boundary.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting boundary:", error);
    return NextResponse.json({ error: "Failed to delete boundary" }, { status: 500 });
  }
}
