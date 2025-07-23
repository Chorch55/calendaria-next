import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-communication.ts';
import '@/ai/flows/generate-appointment-suggestion.ts';
import '@/ai/flows/suggest-reply.ts';
import '@/ai/flows/analyze-call.ts';
import '@/ai/flows/assistant-flow.ts';
