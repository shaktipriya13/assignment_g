import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { nodes, edges } = body;

    // Simplified: Find existing workflow or create new one
    // In a real app, we might handle multiple workflows
    let workflow = await db.workflow.findFirst({
      where: { userId },
    });

    if (workflow) {
      workflow = await db.workflow.update({
        where: { id: workflow.id },
        data: {
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
        },
      });
    } else {
      workflow = await db.workflow.create({
        data: {
          userId,
          name: "My Workflow",
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
        },
      });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("[WORKFLOW_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the single workflow for this user
    const workflow = await db.workflow.findFirst({
        where: { userId }
    });

    return NextResponse.json(workflow || null); 
  } catch (error) {
    console.error("[WORKFLOW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
