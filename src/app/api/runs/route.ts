import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateWorkflowRun } from "@/trigger/workflow";
import { tasks } from "@trigger.dev/sdk/v3";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    // Expect body to contain current full graph or just ID if we load from DB.
    // Ideally, we load the saved workflow from DB to ensure consistency.
    
    // 1. Get User's Saved Workflow
    const workflow = await db.workflow.findFirst({
        where: { userId }
    });

    if (!workflow) {
        return new NextResponse("Workflow not found", { status: 404 });
    }
    
    const nodes = JSON.parse(workflow.nodes as string);
    const edges = JSON.parse(workflow.edges as string);

    // 2. Create Workflow Run Record Synchronously
    const run = await db.workflowRun.create({
      data: {
        workflowId: workflow.id,
        triggerType: "FULL", // Using Enum default
        status: "RUNNING", // Mark as running immediately
      },
    });

    // 3. Trigger the Workflow Task (Orchestrator)
    const handle = await tasks.trigger("generate-workflow-run", {
        runId: run.id, // Pass DB Run ID
        workflowId: workflow.id,
        nodes,
        edges,
        userId
    });

    // Return the DB Run ID, not the Trigger Run ID
    return NextResponse.json({ id: run.id });
  } catch (error) {
    console.error("[WORKFLOW_RUN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const runs = await db.workflowRun.findMany({
      where: {
        workflow: {
          userId,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("[RUNS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
