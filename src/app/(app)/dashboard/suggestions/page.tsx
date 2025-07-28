
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ThumbsUp, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner"
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';


// Mock data for new features suggestions
const mockSuggestionsData = [
  { id: 'sug1', user: 'Ana García', textKey: 'suggestion1' as const, votes: 12, userVoted: false },
  { id: 'sug2', user: 'Carlos Ruiz', textKey: 'suggestion2' as const, votes: 8, userVoted: true },
  { id: 'sug3', user: 'Laura Jimenez', textKey: 'suggestion3' as const, votes: 5, userVoted: false },
];


export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestionsData);
  const [newImprovementText, setNewImprovementText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { t } = useTranslation();


  const handleVoteSuggestion = (id: string) => {
    setSuggestions(currentSuggestions =>
      currentSuggestions.map(sug => {
        if (sug.id === id) {
          return {
            ...sug,
            votes: sug.userVoted ? sug.votes - 1 : sug.votes + 1,
            userVoted: !sug.userVoted,
          };
        }
        return sug;
      })
    );
  };
  
  const handleSubmitImprovement = () => {
    if (!newImprovementText.trim()) {
      toast.error("Error", {
        description: "Please describe your improvement suggestion."
      });
      return;
    }
    // In a real app, you would send this to a backend.
    toast.success("Improvement Sent", {
      description: "Thank you for your suggestion! We have received it and will review it soon."
    });
    setNewImprovementText('');
  };


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('suggestionsTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('suggestionsDescription')}
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-primary" /> 
                {t('improveAppTitle')}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Textarea
                  value={newImprovementText}
                  onChange={(e) => setNewImprovementText(e.target.value)}
                  placeholder={t('improveAppPlaceholder')}
                  rows={4}
                />
                <Button onClick={handleSubmitImprovement} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {t('improveAppButton')}
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center">
                <ThumbsUp className="h-6 w-6 mr-2 text-primary" /> 
                {t('requestFeaturesTitle')}
            </CardTitle>
            <CardDescription>
                {t('requestFeaturesDescription')}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {suggestions.sort((a, b) => b.votes - a.votes).map(sug => (
                    <div key={sug.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{t(sug.textKey)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={sug.userVoted ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleVoteSuggestion(sug.id)}
                                className="flex items-center gap-1.5"
                                aria-label="Vote for the suggestion"
                            >
                                <ThumbsUp className="h-4 w-4" />
                                <span>{sug.votes}</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-6 w-6 mr-2 text-primary" />
            {t('rateAppTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center space-x-2">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <Star
                  key={starValue}
                  className={cn(
                    "h-10 w-10 cursor-pointer transition-colors",
                    (hoverRating >= starValue || rating >= starValue)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  )}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setRating(starValue);
                    toast.success(t('rateAppThanks'), {
                      description: `${t('youGave')} ${starValue} ${starValue === 1 ? t('star') : t('stars')}.`
                    });
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
