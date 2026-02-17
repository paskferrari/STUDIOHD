// Studio Hub Elite - Motion Design System
// Premium, luxury-minimal animation tokens and utilities

import { Easing } from 'react-native-reanimated';

// ============== DURATION TOKENS ==============
export const duration = {
  // Fast - micro-interactions, button press, icon state
  fast: 140,
  
  // Base - standard transitions, card hover, tab switch
  base: 220,
  
  // Slow - page transitions, modal open/close, complex animations
  slow: 360,
  
  // Extended - onboarding animations, badge unlock celebrations
  extended: 500,
} as const;

// ============== EASING CURVES ==============
// Premium, smooth curves for luxury feel
export const easing = {
  // Standard - most UI transitions
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  
  // Enter - elements appearing on screen
  enter: Easing.bezier(0.0, 0.0, 0.2, 1),
  
  // Exit - elements leaving screen
  exit: Easing.bezier(0.4, 0.0, 1, 1),
  
  // Emphasized - attention-grabbing, celebratory
  emphasized: Easing.bezier(0.2, 0.0, 0.0, 1),
  
  // Bounce - subtle bounce for playful interactions
  bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
  
  // Linear - for continuous animations
  linear: Easing.linear,
} as const;

// ============== SPRING CONFIGS ==============
export const spring = {
  // Gentle - subtle, smooth movements
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  
  // Responsive - quick, snappy feedback
  responsive: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  },
  
  // Bouncy - playful, celebratory
  bouncy: {
    damping: 10,
    stiffness: 150,
    mass: 0.6,
  },
  
  // Stiff - minimal overshoot
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
} as const;

// ============== STAGGER DELAYS ==============
export const stagger = {
  // Fast list items
  fast: 30,
  
  // Standard list items
  base: 50,
  
  // Slow, dramatic reveals
  slow: 80,
} as const;

// ============== ANIMATION PRESETS ==============
export const presets = {
  // Fade in from bottom
  fadeInUp: {
    initialY: 20,
    initialOpacity: 0,
    finalY: 0,
    finalOpacity: 1,
    duration: duration.base,
    easing: easing.enter,
  },
  
  // Fade in from right
  fadeInRight: {
    initialX: 20,
    initialOpacity: 0,
    finalX: 0,
    finalOpacity: 1,
    duration: duration.base,
    easing: easing.enter,
  },
  
  // Scale up
  scaleIn: {
    initialScale: 0.9,
    initialOpacity: 0,
    finalScale: 1,
    finalOpacity: 1,
    duration: duration.base,
    easing: easing.enter,
  },
  
  // Badge unlock celebration
  badgeUnlock: {
    initialScale: 0.5,
    initialOpacity: 0,
    finalScale: 1,
    finalOpacity: 1,
    duration: duration.extended,
    easing: easing.bounce,
  },
  
  // Button press
  buttonPress: {
    scale: 0.96,
    duration: duration.fast,
    easing: easing.standard,
  },
  
  // Card hover/press
  cardPress: {
    scale: 0.98,
    duration: duration.fast,
    easing: easing.standard,
  },
} as const;

// ============== REDUCED MOTION ==============
export const reducedMotion = {
  // Minimal duration for accessibility
  duration: 0,
  
  // No transforms
  noTransform: true,
  
  // Instant opacity changes only
  fadeOnly: true,
} as const;

// ============== HELPER FUNCTIONS ==============
export const getStaggerDelay = (index: number, type: keyof typeof stagger = 'base'): number => {
  return index * stagger[type];
};

export const clampDuration = (value: number, min: number = 0, max: number = 1000): number => {
  return Math.max(min, Math.min(max, value));
};
