import { persisted } from 'svelte-persisted-store';

export interface TeamScore {
	/** null = derive from team color. */
	name: string | null;
	score: number;
	jamScore: number;
	timeouts: number;
	reviews: number;
}

export interface Scoreboard {
	visible: boolean;
	position: { right: number; top: number };
	period: number;
	jam: number;
	/** Seconds remaining. */
	periodClock: number;
	jamClock: number;
	teams: { A: TeamScore; B: TeamScore };
}

const team = (): TeamScore => ({ name: null, score: 0, jamScore: 0, timeouts: 3, reviews: 1 });

export const defaultScoreboard = (): Scoreboard => ({
	visible: true,
	position: { right: 0.01, top: 0.12 },
	period: 1,
	jam: 1,
	periodClock: 30 * 60,
	jamClock: 2 * 60,
	teams: { A: team(), B: team() }
});

export const scoreboard = persisted<Scoreboard>('derbyboard-scoreboard', defaultScoreboard());
