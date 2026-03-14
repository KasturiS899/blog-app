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
  let userId: number | null = null;

  try {
    const decoded = verifyToken(req);
    userId = decoded.userId;
  } catch {}
  const posts = await prisma.post.findMany({
    where: {
      AND: [
        category ? { categories: { some: { name: category } } } : {},
        {
          OR: [
            { status: "PUBLISHED" },
            ...(userId ? [{ status: "DRAFT", authorId: userId }] : []),
          ],
        },
      ],
    },
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

    const { title, content, categoryIds, status, imageUrl } = await req.json();
    if (!title || !content)
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 },
      );

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        status: status ?? "DRAFT",
        authorId: decoded.userId,
        categories: {
          connect: categoryIds?.map((id: number) => ({ id })) || [],
        },
      },
      include: { categories: true },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
