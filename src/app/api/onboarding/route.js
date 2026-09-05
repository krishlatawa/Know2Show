import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/redis";
import { onboardingSubmissionSchema } from "@/lib/validations/onboarding";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to complete onboarding." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limiting check
    if (rateLimiter) {
      try {
        const { success } = await rateLimiter.limit(`onboarding_${userId}`);
        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please wait a moment before trying again." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning:", err);
      }
    }

    const body = await req.json();

    // Validate request payload
    const validationResult = onboardingSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { profile, targetRole } = validationResult.data;

    // Execute database transaction to save profile, target role, and update user onboarding status
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert Candidate Profile
      const savedProfile = await tx.profile.upsert({
        where: { userId },
        update: {
          headline: profile.headline,
          bio: profile.bio || null,
          experienceYears: profile.experienceYears,
          seniorityLevel: profile.seniorityLevel,
          skills: profile.skills,
          githubUrl: profile.githubUrl || null,
          linkedinUrl: profile.linkedinUrl || null,
        },
        create: {
          userId,
          headline: profile.headline,
          bio: profile.bio || null,
          experienceYears: profile.experienceYears,
          seniorityLevel: profile.seniorityLevel,
          skills: profile.skills,
          githubUrl: profile.githubUrl || null,
          linkedinUrl: profile.linkedinUrl || null,
        },
      });

      // 2. Upsert Target Role linked to Profile
      const savedTargetRole = await tx.targetRole.upsert({
        where: { profileId: savedProfile.id },
        update: {
          roleTitle: targetRole.roleTitle,
          companyType: targetRole.companyType,
          jobDescription: targetRole.jobDescription || null,
          focusTopics: targetRole.focusTopics,
          difficulty: targetRole.difficulty,
        },
        create: {
          profileId: savedProfile.id,
          roleTitle: targetRole.roleTitle,
          companyType: targetRole.companyType,
          jobDescription: targetRole.jobDescription || null,
          focusTopics: targetRole.focusTopics,
          difficulty: targetRole.difficulty,
        },
      });

      // 3. Mark User as onboarded
      await tx.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });

      return { profile: savedProfile, targetRole: savedTargetRole };
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Error in POST /api/onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to save onboarding details." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isOnboarded: true,
        profile: {
          include: {
            targetRole: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in GET /api/onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
