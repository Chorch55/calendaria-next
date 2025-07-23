// use-toast.tsx
"use client";

import * as React from "react";
import {
  Toaster,
  toast as sonnerToast,
  type ExternalToast,
} from "sonner";

/**
 * Coloca este provider en tu layout (ej. app/layout.tsx)
 * para que exista un <Toaster /> en la app.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{ duration: 5000 }}
      />
    </>
  );
}

/**
 * Hook simplificado para lanzar y descartar toasts.
 * Usa el tipo ExternalToast que exporta Sonner para las opciones.
 */
export function useToast() {
  /**
   * show → lanza un toast.
   * message puede ser string | ReactNode
   * options está tipado como ExternalToast (descripción, action, duration, etc.) :contentReference[oaicite:0]{index=0}
   */
  const show = (
    message: React.ReactNode,
    options?: ExternalToast
  ): string | number => {
    return sonnerToast(message, options);
  };

  /**
   * dismiss → cierra un toast por id, o todos si no se pasa id.
   */
  const dismiss = (id?: string | number) => {
    sonnerToast.dismiss(id);
  };

  return { show, dismiss };
}
