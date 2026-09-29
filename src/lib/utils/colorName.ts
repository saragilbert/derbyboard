const NAMED: [string, [number, number, number]][] = [
	['Red', [220, 30, 30]],
	['Orange', [255, 140, 0]],
	['Yellow', [255, 230, 0]],
	['Green', [40, 160, 60]],
	['Teal', [0, 150, 150]],
	['Blue', [30, 110, 230]],
	['Purple', [110, 50, 160]],
	['Pink', [255, 105, 180]],
	['Brown', [130, 80, 40]],
	['Black', [0, 0, 0]],
	['White', [255, 255, 255]],
	['Gray', [128, 128, 128]]
];

function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.replace('#', ''), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Nearest basic color name for a `#rrggbb` hex. */
export function colorName(hex: string): string {
	const [r, g, b] = hexToRgb(hex);
	let best = NAMED[0][0];
	let bestDist = Infinity;
	for (const [name, [nr, ng, nb]] of NAMED) {
		const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
		if (d < bestDist) {
			bestDist = d;
			best = name;
		}
	}
	return best;
}

/** Black or white, whichever reads better on the given background. */
export function contrastText(hex: string): string {
	const [r, g, b] = hexToRgb(hex);
	return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#000000' : '#ffffff';
}
