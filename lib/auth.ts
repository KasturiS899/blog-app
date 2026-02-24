import jwt from "jsonwebtoken";

export function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  ) as { userId: number; role: string };

  return decoded;
}