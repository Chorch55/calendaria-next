"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Info, AlertTriangle, Lightbulb, Settings, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'info' | 'warning' | 'tip' | 'feature' | 'system' | 'ai';
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const InfoCard: React.FC<InfoCardProps> = ({
  id,
  title,
  description,
  type = 'info',
  icon,
  dismissible = true,
  onDismiss,
  className,
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Verificar si la tarjeta fue previamente cerrada
  useEffect(() => {
    const dismissed = localStorage.getItem(`info-card-dismissed-${id}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, [id]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(`info-card-dismissed-${id}`, 'true');
    onDismiss?.(id);
  }, [id, onDismiss]);

  // Auto-hide después del delay especificado
  useEffect(() => {
    if (autoHide && isVisible && !isDismissed) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, isVisible, isDismissed, handleDismiss]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          header: 'text-green-900',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          header: 'text-yellow-900',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
        };
      case 'tip':
        return {
          container: 'bg-purple-50 border-purple-200 text-purple-800',
          header: 'text-purple-900',
          icon: <Lightbulb className="h-5 w-5 text-purple-600" />
        };
      case 'feature':
        return {
          container: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          header: 'text-indigo-900',
          icon: <Zap className="h-5 w-5 text-indigo-600" />
        };
      case 'system':
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          header: 'text-gray-900',
          icon: <Settings className="h-5 w-5 text-gray-600" />
        };
      case 'ai':
        return {
          container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          header: 'text-emerald-900',
          icon: <Target className="h-5 w-5 text-emerald-600" />
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          header: 'text-blue-900',
          icon: <Info className="h-5 w-5 text-blue-600" />
        };
    }
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  const styles = getTypeStyles();

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all duration-300 ease-in-out',
      styles.container,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {icon || styles.icon}
          </div>
          <div className="flex-1">
            <h3 className={cn('text-sm font-medium', styles.header)}>
              {title}
            </h3>
            <p className="mt-1 text-sm">
              {description}
            </p>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-3 flex-shrink-0 rounded-md opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook para manejar múltiples tarjetas informativas
export const useInfoCards = () => {
  const [dismissedCards, setDismissedCards] = useState<string[]>([]);

  useEffect(() => {
    // Cargar tarjetas cerradas del localStorage
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('info-card-dismissed-')
    );
    const dismissed = keys.map(key => key.replace('info-card-dismissed-', ''));
    setDismissedCards(dismissed);
  }, []);

  const dismissCard = (cardId: string) => {
    setDismissedCards(prev => [...prev, cardId]);
  };

  const isDismissed = (cardId: string) => {
    return dismissedCards.includes(cardId);
  };

  const resetCard = (cardId: string) => {
    localStorage.removeItem(`info-card-dismissed-${cardId}`);
    setDismissedCards(prev => prev.filter(id => id !== cardId));
  };

  const resetAllCards = () => {
    dismissedCards.forEach(cardId => {
      localStorage.removeItem(`info-card-dismissed-${cardId}`);
    });
    setDismissedCards([]);
  };

  return {
    dismissCard,
    isDismissed,
    resetCard,
    resetAllCards,
    dismissedCards
  };
};

export default InfoCard;
