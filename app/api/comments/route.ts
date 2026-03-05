import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, postId, userId, email } = await req.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: "content and postId required" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: userId ?? null,
        guestEmail: userId ? null : email, // allow guest
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const comments = await prisma.comment.findMany({
    where: postId ? { postId: Number(postId) } : undefined,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(comments);
}
