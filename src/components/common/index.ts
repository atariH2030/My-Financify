/**
 * Common Components - Exportação centralizada
 * Facilita imports: import { Button, Card, Input } from '@/components/common'
 * v3.1 - Sistema completo + Acessibilidade + ViewModeToggle
 */

export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Modal } from './Modal';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ToastProvider, useToast } from './Toast';
export { default as SkeletonLoader, SkeletonPresets } from './SkeletonLoader';
export { default as Tooltip } from './Tooltip';
export { default as ViewModeToggle } from './ViewModeToggle';
export { AnimationsDemo } from './AnimationsDemo';
export type { Toast, ToastType } from './Toast';
export type { ViewMode } from './ViewModeToggle';

