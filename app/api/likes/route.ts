import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { postId, userId } = body;

  if (!postId || !userId) {
    return NextResponse.json(
      { error: "postId and userId required" },
      { status: 400 }
    );
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    return NextResponse.json(like);
  } catch (error) {
    return NextResponse.json(
      { error: "User already liked this post" },
      { status: 400 }
    );
  }
}