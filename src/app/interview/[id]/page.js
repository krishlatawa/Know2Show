import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import LiveInterviewRoom from "@/components/interview/LiveInterviewRoom";

export const metadata = {
  title: "Live Adaptive Interview Room | Know2Show",
  description: "Real-time AI Mock Interview Room with Adaptive Evaluation",
};

export default async function InterviewRoomPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/api/auth/signin");
  }

  const resolvedParams = await params;
  const sessionId = resolvedParams?.id;

  if (!sessionId) {
    notFound();
  }

  // Retrieve the interview session
  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: {
          profile: {
            include: {
              targetRole: true,
            },
          },
        },
      },
    },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    notFound();
  }

  // Serialize session dates and data cleanly for client component
  const serializedSession = {
    ...interviewSession,
    createdAt: interviewSession.createdAt?.toISOString() || null,
    startedAt: interviewSession.startedAt?.toISOString() || null,
    endedAt: interviewSession.endedAt?.toISOString() || null,
  };

  return <LiveInterviewRoom initialSession={serializedSession} />;
}
