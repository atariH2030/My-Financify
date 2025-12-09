/**
 * @file animations.ts
 * @description Sistema de micro-animações usando Framer Motion
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import { Variants } from 'framer-motion';

/**
 * Animação de fade in com slide
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Animação de fade in com slide lateral
 */
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

/**
 * Animação de fade in com slide lateral direita
 */
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/**
 * Animação de scale in
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

/**
 * Animação de bounce
 */
export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
  exit: { opacity: 0, scale: 0.5 },
};

/**
 * Animação de rotate in
 */
export const rotateIn: Variants = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 10 },
};

/**
 * Animação de lista (stagger children)
 */
export const listContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

/**
 * Animação de item de lista
 */
export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

/**
 * Animação de card hover
 */
export const _cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      type: 'tween',
      ease: 'easeInOut',
    },
  },
};

/**
 * Animação de button tap
 */
export const _buttonTap = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.05 },
};

/**
 * Transição padrão suave
 */
export const smoothTransition = {
  duration: 0.3,
  ease: 'easeInOut' as const,
};

/**
 * Transição com spring
 */
export const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Modal backdrop transition
 */
export const backdropTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Notification slide transition
 */
export const notificationSlide: Variants = {
  initial: { x: 400, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Collapse/Expand animation
 */
export const collapse: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: smoothTransition,
  },
};

/**
 * Shimmer loading animation
 */
export const _shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Pulse animation (para notificações/badges)
 */
export const _pulse = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};
