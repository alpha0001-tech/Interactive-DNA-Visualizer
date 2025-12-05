import { BaseType } from './constants';

export interface DNAPair {
  id: string;
  left: BaseType;
  right: BaseType;
  mutationTime?: number; // Timestamp of last mutation for animation
}

export interface DNAState {
  length: number;
  twist: number; // Degrees
  autoSpin: boolean;
  spinSpeed: number;
}