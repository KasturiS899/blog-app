// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      role: string;
    };

    // 3️⃣ Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }, // ✅ match token payload
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Return user info
    return NextResponse.json(user);
  } catch (err) {
    console.error("JWT verification error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}