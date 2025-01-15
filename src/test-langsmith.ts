import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { LangChainTracer } from "langchain/callbacks";

async function testLangSmithTracing() {
  // Initialize the tracer
  const tracer = new LangChainTracer();

  // Initialize the chat model with tracing
  const model = new ChatOpenAI({
    callbacks: [tracer],
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Test run
    const result = await model.invoke("What is the capital of France?");
    console.log("Test completed successfully!");
    console.log("Response:", result);
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Run the test
testLangSmithTracing();