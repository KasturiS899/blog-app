import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(req);

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admin can delete posts" },
        { status: 403 }
      );
    }

    const postId = parseInt(params.id);

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      message: "Post deleted successfully",
    });

  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(req);
    const postId = parseInt(params.id);
    const body = await req.json();
    const { title, content } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // ADMIN can edit anything
    if (decoded.role !== "ADMIN") {
      // AUTHOR can only edit their own post
      if (decoded.role !== "AUTHOR" || post.authorId !== decoded.userId) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title ?? post.title,
        content: content ?? post.content,
      },
    });

    return NextResponse.json(updatedPost);

  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}