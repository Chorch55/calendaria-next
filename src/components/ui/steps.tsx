'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
  completed?: boolean;
  active?: boolean;
}

interface StepsProps {
  steps: Step[];
}

export function Steps({ steps }: StepsProps) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center">
            {/* Línea conectora */}
            {i < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute w-full h-[2px] top-4 left-1/2",
                  step.completed ? "bg-primary" : "bg-border"
                )} 
              />
            )}
            
            {/* Círculo indicador */}
            <div 
              className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300",
                step.completed && "border-primary bg-primary text-primary-foreground",
                step.active && "border-primary",
                !step.completed && !step.active && "border-border"
              )}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{i + 1}</span>
              )}
            </div>
            
            {/* Texto */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max">
              <p 
                className={cn(
                  "text-sm font-medium",
                  (step.completed || step.active) && "text-foreground",
                  !step.completed && !step.active && "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p 
                className={cn(
                  "text-xs mt-0.5",
                  (step.completed || step.active) && "text-muted-foreground",
                  !step.completed && !step.active && "text-muted-foreground/60"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
