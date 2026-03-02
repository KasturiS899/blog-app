import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// GET all posts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const category = searchParams.get("category");
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: category
      ? { categories: { some: { name: category } } }
      : undefined,
    skip,
    take: limit,
    orderBy: { id: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      categories: true,
      _count: { select: { likes: true, comments: true } },
      comments: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(posts);
}

// POST create new post
export async function POST(req: Request) {
  try {
    const decoded = verifyToken(req);
    if (decoded.role !== "ADMIN" && decoded.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, content, categoryIds } = await req.json();
    if (!title || !content) return NextResponse.json({ error: "All fields required" }, { status: 400 });

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: decoded.userId,
        categories: { connect: categoryIds?.map((id: number) => ({ id })) || [] },
      },
      include: { categories: true },
    });

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}