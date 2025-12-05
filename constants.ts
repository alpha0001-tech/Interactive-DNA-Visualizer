import { Color } from 'three';

export const COLORS = {
  A: new Color('#4ade80'), // Green-400
  T: new Color('#f87171'), // Red-400
  C: new Color('#60a5fa'), // Blue-400
  G: new Color('#facc15'), // Yellow-400
  BACKBONE: new Color('#e5e7eb'), // Gray-200
  SUGAR: new Color('#fbbf24'), // Amber-400
  BOND: new Color('#ffffff'),
  HIGHLIGHT: new Color('#ffffff'),
};

export const CONFIG = {
  RADIUS: 2,
  RISE: 0.6, // Vertical distance between base pairs
  BASE_WIDTH: 1.2,
  BASE_HEIGHT: 0.2,
  BASE_DEPTH: 0.6,
  BACKBONE_RADIUS: 0.3,
};

export const BASES = ['A', 'T', 'C', 'G'] as const;
export type BaseType = typeof BASES[number];

export const PAIRS: Record<BaseType, BaseType> = {
  A: 'T',
  T: 'A',
  C: 'G',
  G: 'C',
};