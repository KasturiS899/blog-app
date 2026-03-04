import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const postId = parseInt(params.id);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { categories: true, author: { select: { id: true, name: true, email: true } } },
  });

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(req);
    const postId = parseInt(params.id);
    const { title, content, categoryIds } = await req.json();

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (decoded.role !== "ADMIN" && post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title ?? post.title,
        content: content ?? post.content,
        categories: categoryIds ? { set: categoryIds.map((id: number) => ({ id })) } : undefined,
      },
      include: { categories: true },
    });

    return NextResponse.json(updatedPost);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const decoded = verifyToken(req);
    const postId = parseInt(params.id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (decoded.role !== "ADMIN" && post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ message: "Post deleted" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}