import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { executeNode } from "./nodes";

interface WorkflowPayload {
  runId: string; // From API
  workflowId: string;
  nodes: any[];
  edges: any[];
  userId: string;
}

export const generateWorkflowRun = task({
  id: "generate-workflow-run",
  run: async (payload: WorkflowPayload) => {
    const { runId, workflowId, nodes, edges, userId } = payload;
    logger.info(`Starting workflow run ${runId} for ${workflowId} with ${nodes.length} nodes`);

    // 1. (Skipped) WorkflowRun already created by API.
    // We just use runId.

    const nodeOutputs: Record<string, any> = {}; // Store outputs: { nodeId: output }

    try {
      // 2. Topological Sort (Simple Layering)
      // Calculate in-degrees
      const inDegree = new Map<string, number>();
      const adj = new Map<string, string[]>();

      nodes.forEach((n) => {
        inDegree.set(n.id, 0);
        adj.set(n.id, []);
      });

      edges.forEach((e) => {
        adj.get(e.source)?.push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      });

      // Find initial layer
      let queue: string[] = nodes
        .filter((n) => (inDegree.get(n.id) || 0) === 0)
        .map((n) => n.id);

      // 3. Execution Loop
      while (queue.length > 0) {
        const layer = [...queue];
        queue = []; // Reset for next layer
        
        logger.info(`Executing layer: ${layer.join(", ")}`);

        // Trigger all nodes in this layer in PARALLEL
        // We use batchTriggerAndWait for robust parallel execution
        const batchPayloads = layer.map((nodeId) => {
            const node = nodes.find((n) => n.id === nodeId);
            
            // Gather inputs from upstream
            const incomingEdges = edges.filter(e => e.target === nodeId);
            const inputs: Record<string, any> = {};
            
            incomingEdges.forEach(e => {
                const sourceOutput = nodeOutputs[e.source];
                // Map source output to input handle logic (simplified)
                if (sourceOutput) {
                    inputs[e.targetHandle || "default"] = sourceOutput;
                }
            });

            return {
              payload: {
                nodeId,
                type: node.type,
                data: node.data,
                inputs,
                workflowRunId: runId
              }
            };
        });

        const batchResults = await executeNode.batchTriggerAndWait(batchPayloads);

        // Process results
        for (const run of batchResults.runs) {
           if (run.ok && run.output) {
               const { nodeId, output } = run.output;
               
               // Store output
               nodeOutputs[nodeId] = output;
               
               // Unlock neighbors
               const neighbors = adj.get(nodeId) || [];
               for (const neighbor of neighbors) {
                   const d = (inDegree.get(neighbor) || 0) - 1;
                   inDegree.set(neighbor, d);
                   if (d === 0) queue.push(neighbor);
               }
           }
        }
      }

      // 4. Mark Workflow as Completed
      await db.workflowRun.update({
        where: { id: runId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      
      logger.info("Workflow run completed successfully");
      return { runId, status: "COMPLETED" };

    } catch (error: any) {
      logger.error("Workflow run failed", { error });
      
      await db.workflowRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: error.message,
        },
      });
      throw error;
    }
  },
});
