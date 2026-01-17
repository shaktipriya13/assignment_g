import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";

interface RunNodePayload {
  nodeId: string;
  type: string;
  data: any;
  inputs: Record<string, any>; // Data from upstream nodes
  workflowRunId: string;
}

export const executeNode = task({
  id: "execute-node",
  run: async (payload: RunNodePayload) => {
    const { nodeId, type, data, inputs, workflowRunId } = payload;
    console.log(`[Node ${nodeId}] Starting execution. Type: ${type}`);

    // 1. Create NodeRun record (RUNNING)
    await db.nodeRun.create({
      data: {
        nodeId,
        workflowRunId,
        status: "RUNNING",
        startedAt: new Date(),
        inputs: JSON.stringify(inputs),
      },
    });

    try {
      let output: any = {};

      // 2. Execution Logic
      console.log(`[Node ${nodeId}] Executing type: "${type}"`);
      
      if (type === "textNode") {
        // Just pass through text
        output = { text: data.text };
        // Simulate delay
        await new Promise((r) => setTimeout(r, 1000));
      } else if (type === "llmNode") {
        // Real Gemini Integration
        const apiKey = process.env.GEMINI_API_KEY;
        console.log(`[Node ${nodeId}] Gemini API Key present: ${!!apiKey}`);
        
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable");

        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const modelName = data.model || "gemini-pro";
        const model = genAI.getGenerativeModel({ model: modelName });

        const localSystemPrompt = data.systemPrompt || "You are a helpful assistant.";
        const localUserMessage = data.userMessage || "";
        
        let combinedContext = "";
        if (inputs && typeof inputs === 'object') {
           Object.values(inputs).forEach((val: any) => {
              // Be robust about input types
              if (typeof val === 'string') {
                  combinedContext += `\n\nInput Context: ${val}`;
              } else if (typeof val === 'object' && val.text) {
                  combinedContext += `\n\nInput Context: ${val.text}`;
              }
           });
        }

        const fullPrompt = `${localUserMessage}\n${combinedContext}`;

        console.log(`[Node ${nodeId}] Calling Gemini ${modelName} with prompt length: ${fullPrompt.length}`);

        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: `System Instruction: ${localSystemPrompt}\n\nUser Message: ${fullPrompt}` }] }
            ]
        });
        
        const responseText = result.response.text();
        output = { response: responseText };
      }
      else {
          // Default pass-through
          output = { ...inputs, ...data };
      }

      // 3. Update NodeRun (COMPLETED)
      await db.nodeRun.updateMany({
        where: { nodeId, workflowRunId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          outputs: JSON.stringify(output),
        },
      });
      
      console.log(`[Node ${nodeId}] Finished. Output:`, output);
      return { nodeId, output, status: "COMPLETED" };

    } catch (error: any) {
      console.error(`[Node ${nodeId}] Failed:`, error);
      
      // Update NodeRun (FAILED)
      await db.nodeRun.updateMany({
        where: { nodeId, workflowRunId },
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
