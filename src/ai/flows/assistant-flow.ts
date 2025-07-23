'use server';
/**
 * @fileOverview A helpful AI assistant for the CalendarIA application.
 *
 * - askAssistant - A function that handles queries to the assistant.
 * - AssistantInput - The input type for the askAssistant function.
 * - AssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user’s question or prompt for the assistant.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The assistant’s helpful response.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function askAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are a friendly and expert AI assistant for an application called "CalendarIA".
Your goal is to help users understand and use the application effectively.

CalendarIA is an AI-powered calendar and unified communications platform. Its key features include:
- Unified Inbox: Manages emails (Gmail, Outlook) and WhatsApp messages in one place.
- Calendar Integration: Syncs appointments, which can be created automatically from messages.
- Task Management: A Kanban-style board to organize and track team tasks.
- Phone Call Logs: AI-analyzed summaries and recordings of inbound calls.
- AI-Powered Assistance: Features like automated responses, message summarization, and appointment suggestions.
- Settings: Allows users to connect accounts, customize the UI (theme, font size, sidebar order), and manage notifications.
- Team & Role Management: Admins can invite users and define permissions.

When a user asks a question, provide a clear, concise, and helpful response. Be polite and encouraging.
If a user asks about a function you don't have, explain that you're an assistant for the CalendarIA app and can only answer questions about its features.

User's query: {{{query}}}
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
