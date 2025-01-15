import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: import.meta.env.VITE_PINECONE_API_KEY,
});

export default pinecone; 