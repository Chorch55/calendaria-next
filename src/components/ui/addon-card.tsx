'use client';

import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AddonCardProps {
  title: string;
  description: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  price?: string;
  includedAmount?: string;
  unit?: string;
  className?: string;
}

export function AddonCard({
  title,
  description,
  value,
  onDecrease,
  onIncrease,
  min = 0,
  max = Infinity,
  price,
  includedAmount,
  unit,
  className
}: AddonCardProps) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-lg", className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '0%' }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          {includedAmount && (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
              {includedAmount} incluidos
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onDecrease}
              disabled={value <= min}
              className="h-8 w-8 rounded-full"
            >
              -
            </Button>
            <span className="text-xl font-semibold min-w-[2ch] text-center">
              {value}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={onIncrease}
              disabled={value >= max}
              className="h-8 w-8 rounded-full"
            >
              +
            </Button>
          </div>

          {price && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Precio</div>
              <div className="font-semibold">
                {price}/{unit || 'unidad'}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
