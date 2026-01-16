import { Edge, Node } from "reactflow";

export type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface ExecutionOptions {
  nodes: Node[];
  edges: Edge[];
  onStatusUpdate: (nodeId: string, status: RunStatus) => void;
}

/**
 * Mocks the execution of a workflow on the client side.
 * Uses a BFS / Topological Sort approach to run nodes in order.
 */
export async function runWorkflowMock({ nodes, edges, onStatusUpdate }: ExecutionOptions) {
  // 1. Build Adjacency List (Graph) & In-Degree Map
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize
  nodes.forEach((node) => {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
    onStatusUpdate(node.id, "PENDING"); // Reset status
  });

  // Populate Graph
  edges.forEach((edge) => {
    if (adj.has(edge.source) && inDegree.has(edge.target)) {
      adj.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // 2. Find Initial Ready Nodes (In-Degree 0)
  const queue: string[] = [];
  nodes.forEach((node) => {
    if ((inDegree.get(node.id) || 0) === 0) {
      queue.push(node.id);
    }
  });

  // 3. Execution Loop
  // In a real engine, we might run parallel batches.
  // Here, we'll process the queue sequentially for simplicity, but simulating async work.
  
  // To support parallel execution visualization:
  // We can convert the queue processing to run all *currently* ready nodes at once.
  
  while (queue.length > 0) {
    // Snapshot current queue as the "batch" to run in parallel
    const currentBatch = [...queue];
    queue.length = 0; // Clear queue for next batch

    // Start all in batch
    currentBatch.forEach(id => onStatusUpdate(id, "RUNNING"));

    // Wait for them to "finish" (Mock Execution)
    // Random delay for realism between 1s and 2s
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Complete all in batch
    for (const nodeId of currentBatch) {
      onStatusUpdate(nodeId, "COMPLETED");

      // Check neighbors
      const neighbors = adj.get(nodeId) || [];
      for (const neighborId of neighbors) {
        const currentInDegree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, currentInDegree);

        // If dependency satisfied, add to next batch
        if (currentInDegree === 0) {
          queue.push(neighborId);
        }
      }
    }
  }
  
  console.log("Workflow Execution Completed");
}
