/**
 * Common Components - Exportação centralizada
 * Facilita imports: import { Button, Card, Input } from '@/components/common'
 * v2.3 - Sistema completo + Performance Otimizada
 */

export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Modal } from './Modal';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ToastProvider, useToast } from './Toast';
export { default as SkeletonLoader, SkeletonPresets } from './SkeletonLoader';
export type { Toast, ToastType } from './Toast';
