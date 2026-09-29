import { persisted } from 'svelte-persisted-store';
import type { PackMethod } from '$lib/trackMath';
import type { Palette } from '$lib/constants';

/**
 * Board-wide settings, persisted across sessions. Currently holds the pack
 * measuring method (Sector vs Rectangle); extend here as more board settings
 * are added.
 */
export interface BoardSettings {
	packMethod: PackMethod;
	// Optional: settings persisted before colors existed won't have it.
	palette?: Partial<Palette>;
	/** Clamp dragged team players to the track surface. */
	keepInBounds?: boolean;
	hideOfficials?: boolean;
	leadPosition?: { x: number; y: number };
	quickControlsVisible?: boolean;
	quickControlsPosition?: { x: number; y: number };
}

export const boardSettings = persisted<BoardSettings>('derbyboard-board-settings', {
	packMethod: 'sector'
});
