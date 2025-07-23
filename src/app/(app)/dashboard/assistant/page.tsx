"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { askAssistant } from '@/ai/flows/assistant-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const { t } = useTranslation();
  const initialMessageContent = t('assistant_initial_message');

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialMessageContent }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect updates the initial message if the language changes
    // and no conversation has started yet.
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: initialMessageContent }]);
    }
    // We only want to run this when the initial message content should change.
    // We intentionally don't include `messages` in the dependency array to avoid
    // an infinite loop, as we only want to react to language changes for the
    // initial message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessageContent]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askAssistant({ query: input });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling assistant flow:", error);
      show(
        <>
          <strong>{t('assistant_error_toast_title')}</strong>
          <div>{t('assistant_error_toast_description')}</div>
        </>
      );
       const errorMessage: Message = { role: 'assistant', content: t('assistant_error_message') };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('assistant_title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('assistant_description')}
        </p>
      </div>

      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader className="border-b">
           <div className="flex items-center">
                <Bot className="h-6 w-6 mr-2 text-primary" />
                <CardTitle>{t('assistant_chat_title')}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-md rounded-lg px-4 py-3 text-sm whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                       <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-md rounded-lg px-4 py-3 bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-background">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('assistant_placeholder')}
                className="flex-1 resize-none"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
