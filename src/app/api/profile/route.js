import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { candidateProfileSchema, targetRoleSchema } from "@/lib/validations/onboarding";
import { z } from "zod";

const profileUpdateSchema = z.object({
  profile: candidateProfileSchema.partial(),
  targetRole: targetRoleSchema.partial(),
});

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { 
        targetRole: true,
        resumeAnalysis: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation error", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { profile, targetRole } = validation.data;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProfile = profile
        ? await tx.profile.update({
            where: { id: existingProfile.id },
            data: profile,
          })
        : existingProfile;

      const updatedTargetRole = targetRole
        ? await tx.targetRole.update({
            where: { profileId: existingProfile.id },
            data: targetRole,
          })
        : await tx.targetRole.findUnique({ where: { profileId: existingProfile.id } });

      return { profile: updatedProfile, targetRole: updatedTargetRole };
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
