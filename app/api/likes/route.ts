import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { postId, userId, guestId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        ...(userId ? { userId } : { guestId }),
      },
    });

    // UNLIKE
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ liked: false });
    }

    // LIKE
    const like = await prisma.like.create({
      data: {
        postId,
        userId: userId ?? null,
        guestId: userId ? null : guestId,
      },
    });

    return NextResponse.json({ liked: true, like });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}