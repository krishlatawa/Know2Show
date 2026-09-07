import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimiter } from "@/lib/redis";

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Validate payload with Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 2. Rate limiting check (if Redis is configured)
    if (rateLimiter) {
      try {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const { success } = await rateLimiter.limit(`register_${ip}`);
        if (!success) {
          return NextResponse.json(
            { error: "Too many registration attempts. Please wait a moment." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning during registration:", err);
      }
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isOnboarded: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully!",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
