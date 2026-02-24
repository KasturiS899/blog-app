import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, postId, userId } = body;

  if (!content || !postId || !userId) {
    return NextResponse.json(
      { error: "All fields required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
    },
  });

  return NextResponse.json(comment);
}

export async function GET() {
  const comments = await prisma.comment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return NextResponse.json(comments);
}