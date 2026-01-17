import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15+ (and 16)
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const run = await db.workflowRun.findUnique({
      where: { id },
      include: {
        nodeRuns: true, // Include node statuses
      },
    });

    if (!run) {
      return new NextResponse("Run not found", { status: 404 });
    }

    // Verify ownership (optional but recommended: check if workflow belongs to user)
    // For now assuming ID knowledge implies access or we can fetch workflow.userId join

    return NextResponse.json(run);
  } catch (error) {
    console.error("[RUN_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
