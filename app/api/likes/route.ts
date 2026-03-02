import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const like = await prisma.like.create({
      data: {
        postId,
        userId: userId ?? null,
      },
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Already liked or error occurred" },
      { status: 400 },
    );
  }
}
