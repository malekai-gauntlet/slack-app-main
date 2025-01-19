console.log('Starting server script...');

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from 'openai';

// Add debug log before config
console.log('Loading environment variables...');
dotenv.config();
console.log('Environment variables loaded...');

// Validate required environment variables
const requiredEnvVars = [
    'OPENAI_API_KEY', 
    'PINECONE_API_KEY', 
    'PINECONE_INDEX',
    'PINECONE_SUMMARY_INDEX',
    'PINECONE_CHUNK_INDEX'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Error: Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;
const PINECONE_INDEX = process.env.PINECONE_INDEX;
const PINECONE_SUMMARY_INDEX = process.env.PINECONE_SUMMARY_INDEX;
const PINECONE_CHUNK_INDEX = process.env.PINECONE_CHUNK_INDEX;

console.log('Initializing server...');

// Simple in-memory store for conversation history
const conversationHistory = new Map();

// Helper function to get conversation context
function getConversationContext(sessionId) {
    if (!conversationHistory.has(sessionId)) {
        conversationHistory.set(sessionId, []);
    }
    return conversationHistory.get(sessionId);
}

// Helper function to add exchange to history
function addToHistory(sessionId, exchange) {
    const history = getConversationContext(sessionId);
    history.push(exchange);
    // Keep only last 5 exchanges to prevent context from getting too long
    if (history.length > 5) history.shift();
}

app.use(cors());
app.use(express.json());

console.log('Initializing Pinecone client...');

let pinecone;
try {
    pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });
    console.log('Pinecone client initialized successfully');
} catch (error) {
    console.error('Error initializing Pinecone client:', error);
    process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Classify
async function classifyQueryIntent(prompt, llm) {
    const classificationPrompt = `As an AI assistant, analyze this query and classify its primary intent. The query is: "${prompt}"

    Choose ONE of these categories:
    1. RESOURCE_REQUEST - User is specifically looking for files, documents, or shared resources
    2. HANDBOOK_KNOWLEDGE - User asks about gauntlet, AI, or logistics with the GauntletAI program
    3. GENERAL_QUERY - User is asking a general question or making a request that doesn't fit the above

    If unsure, choose Handbook Knowledge. Respond with just the category name.`;

    const response = await llm.invoke(classificationPrompt);
    return response.content.trim();
}

// Main query endpoint
app.post('/api/query', async (req, res) => {
    try {
        const { prompt, sessionId = 'default' } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const history = getConversationContext(sessionId);
        const conversationContext = history.length ? 
            `Previous conversation:\n${history.map(h => 
                `User: ${h.prompt}\nAssistant: ${h.response}`).join('\n')}\n\nCurrent question:` : '';

        // Initialize LLM
        const llm = new ChatOpenAI({
            temperature: 0.2,
            modelName: "gpt-4o"
        });

        // Classify the query intent
        const queryIntent = await classifyQueryIntent(prompt, llm);
        console.log('Query intent classified as:', queryIntent);

        if (queryIntent === 'RESOURCE_REQUEST') {
            // Existing resource query logic
            const embeddings = new OpenAIEmbeddings({
                modelName: "text-embedding-ada-002"
            });
            const index = pinecone.index(PINECONE_INDEX);
            
            // Build filter based on query type and time frame
            const filter = {
                $and: [
                    { type: { $in: ['slack_file', 'twitter_post'] } }
                ]
            };

            const vectorstore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: index,
                namespace: "slack-messages",
                filter: filter.$and.length ? filter : undefined
            });

            const retriever = vectorstore.asRetriever({ k: 20 });
            const context = await retriever.invoke(prompt);

            // For resource queries, format response with files/links
            const resources = context.map(doc => ({
                type: doc.metadata.type,
                name: doc.metadata.type === 'twitter_post' ? 'Twitter Resource' : (doc.metadata.name || 'Resource'),
                url: doc.metadata.url || doc.metadata.tweet_url,
                created_at: doc.metadata.created_at
            }));

            const response = await llm.invoke(
                `${conversationContext}
                User: ${prompt}
                
                Here are the available resources: ${JSON.stringify(resources)}
                
                In 1-2 short sentences, summarize these resources.`
            );

            // Store the exchange in history
            addToHistory(sessionId, {
                prompt,
                response: response.content,
                resources
            });

            res.json({
                response: {
                    blocks: [
                        { type: "section", text: { type: "mrkdwn", text: response.content } },
                        ...resources.map(r => ({
                            type: "file",
                            external_id: r.url,
                            source: "remote",
                            title: r.name
                        }))
                    ]
                },
                context: resources
            });
        } else {
            // Default handbook knowledge query with enhanced context
            const embeddings = new OpenAIEmbeddings({
                modelName: "text-embedding-ada-002"
            });
            const summaryIndex = pinecone.index(PINECONE_SUMMARY_INDEX);
            const chunkIndex = pinecone.index(PINECONE_CHUNK_INDEX);
            
            // Query both indices
            const summaryStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: summaryIndex,
                namespace: ""
            });
            
            const chunkStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: chunkIndex,
                namespace: ""
            });

            const [summaries, details] = await Promise.all([
                summaryStore.similaritySearch(prompt, 1),
                chunkStore.similaritySearch(prompt, 3)
            ]);

            // Create context combining both
            const context = `
Overview:
${summaries[0]?.pageContent || 'No summary available'}

Specific Details:
${details.map((d, i) => `[${i + 1}] ${d.pageContent}`).join('\n\n')}`;

            const aiPrompt = `You are a friendly and knowledgeable assistant who is an expert on the GauntletAI program. 
${queryIntent === 'HANDBOOK_KNOWLEDGE' ? 'Use the handbook information below to provide a detailed response.' : 'Provide a natural response, and reference the handbook if relevant to the query (e.g. if anything about gauntlet is mentioned)'}

User Query: "${prompt}"

${queryIntent === 'HANDBOOK_KNOWLEDGE' ? 'Handbook Information:' : 'Additional Context (reference only if relevant):'}
${context}

Previous Conversation:
${conversationContext}

IMPORTANT: 
- Keep your response clear and concise, no longer than 2 sentences
- Only use citations [X] when you are specifically referencing information from the handbook
- For general greetings or casual conversation, respond naturally without citations
- For handbook-related queries, include at least one citation using [X]
- If multiple handbook chunks support a point, cite all relevant chunks
- Do not include any tags like [Overview] in your response
- Do not force citations if the response doesn't require handbook information`;

            const response = await llm.invoke(aiPrompt);

            // Store the exchange in history
            addToHistory(sessionId, {
                prompt,
                response: response.content
            });

            // Check if the response contains any citations
            const hasCitations = /\[\d+\]/.test(response.content);

            // Format response with citations section only if citations are used
            res.json({ 
                response: {
                    blocks: [
                        {
                            type: "section",
                            text: { 
                                type: "mrkdwn", 
                                text: response.content 
                            }
                        },
                        ...(hasCitations ? [
                            {
                                type: "divider"
                            },
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: "*Sources*"
                                }
                            },
                            ...details.map((d, i) => ({
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: `*[${i + 1}]* ${d.pageContent}`
                                }
                            }))
                        ] : [])
                    ]
                },
                metadata: {
                    source: hasCitations ? 'GauntletAI Handbook' : 'General Response',
                    context: hasCitations ? {
                        summary: summaries[0]?.pageContent,
                        details: details.map((d, i) => ({
                            citation: `[${i + 1}]`,
                            content: d.pageContent
                        }))
                    } : null
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Server initialization complete');
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Add error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Add error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
}); 