import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Name required" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Category already exists" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const categories = await prisma.category.findMany();
  return NextResponse.json(categories);
}