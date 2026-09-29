<script lang="ts">
	import { boardSettings } from '$lib/stores/boardSettings';
	import { leadJammer } from '$lib/stores/leadJammer';
	import { scoreboard, type TeamScore } from '$lib/stores/scoreboard';
	import { DEFAULT_PALETTE } from '$lib/constants';
	import { colorName, contrastText } from '$lib/utils/colorName';

	type Team = 'A' | 'B';

	let palette = $derived({ ...DEFAULT_PALETTE, ...$boardSettings.palette });
	let position = $derived($scoreboard.position ?? { right: 0.01, top: 0.12 });
	let editing = $state<string | null>(null);
	let draft = $state('');
	let dragging = $state(false);
	let dragStart = $state({ x: 0, y: 0, right: 0, top: 0 });

	function teamColor(t: Team) {
		return t === 'A' ? palette.teamAPrimary : palette.teamBPrimary;
	}

	function teamName(t: Team) {
		return $scoreboard.teams[t].name ?? colorName(teamColor(t));
	}

	function formatClock(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	}

	/** Accepts "m:ss" or plain seconds. */
	function parseClock(value: string): number | null {
		const parts = value.split(':').map((p) => Number(p));
		if (parts.some((n) => !Number.isInteger(n) || n < 0) || parts.length > 2) return null;
		return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
	}

	function parseCount(value: string): number | null {
		const n = Number(value);
		return Number.isInteger(n) && n >= 0 ? n : null;
	}

	function setTeam(t: Team, patch: Partial<TeamScore>) {
		scoreboard.update((s) => ({ ...s, teams: { ...s.teams, [t]: { ...s.teams[t], ...patch } } }));
	}

	function startEdit(key: string, value: string) {
		editing = key;
		draft = value;
	}

	function save(key: string, commit: (v: string) => void) {
		if (editing !== key) return;
		commit(draft.trim());
		editing = null;
	}

	function onKey(e: KeyboardEvent, key: string, commit: (v: string) => void) {
		if (e.key === 'Enter') save(key, commit);
		if (e.key === 'Escape') editing = null;
	}

	function focus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	function startDrag(event: PointerEvent) {
		const target = event.target;
		if (target instanceof Element && target.closest('input, button')) return;
		dragging = true;
		dragStart = {
			x: event.clientX,
			y: event.clientY,
			right: position.right,
			top: position.top
		};
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function moveDrag(event: PointerEvent) {
		if (!dragging) return;
		const right = Math.max(
			0,
			Math.min(0.9, dragStart.right - (event.clientX - dragStart.x) / window.innerWidth)
		);
		const top = Math.max(
			0,
			Math.min(0.9, dragStart.top + (event.clientY - dragStart.y) / window.innerHeight)
		);
		scoreboard.update((s) => ({ ...s, position: { right, top } }));
	}

	function stopDrag() {
		dragging = false;
	}

	const commitCount = (apply: (n: number) => void) => (v: string) => {
		const n = parseCount(v);
		if (n !== null) apply(n);
	};

	const commitClock = (apply: (n: number) => void) => (v: string) => {
		const n = parseClock(v);
		if (n !== null) apply(n);
	};
</script>

{#snippet field(key: string, value: string, commit: (v: string) => void, cls: string)}
	{#if editing === key}
		<input
			class="w-full min-w-0 rounded bg-white px-1 text-center text-black outline-none {cls}"
			bind:value={draft}
			use:focus
			onkeydown={(e) => onKey(e, key, commit)}
			onblur={() => save(key, commit)}
		/>
	{:else}
		<span
			class="block cursor-pointer select-none truncate rounded hover:bg-white/10 {cls}"
			role="button"
			tabindex="-1"
			title="Double-click to edit"
			ondblclick={() => startEdit(key, value)}>{value}</span
		>
	{/if}
{/snippet}

{#snippet teamPanel(t: Team)}
	{@const data = $scoreboard.teams[t]}
	<div class="flex w-24 flex-col items-center gap-1 sm:w-28">
		<div
			class="w-full rounded px-1 py-0.5 text-center text-xs font-bold uppercase tracking-wide"
			style="background:{teamColor(t)};color:{contrastText(teamColor(t))}"
		>
			{@render field(`name${t}`, teamName(t), (v) => setTeam(t, { name: v || null }), '')}
		</div>
		{@render field(
			`score${t}`,
			String(data.score),
			commitCount((n) => setTeam(t, { score: n })),
			'text-4xl font-bold leading-none sm:text-5xl'
		)}
		<div class="flex items-center gap-1 text-[10px] text-gray-400">
			JAM
			{@render field(
				`jamScore${t}`,
				String(data.jamScore),
				commitCount((n) => setTeam(t, { jamScore: n })),
				'text-sm font-bold text-white'
			)}
		</div>
		<div class="flex items-center gap-1">
			{#each [0, 1, 2] as i (i)}
				<button
					type="button"
					class="h-2.5 w-4 rounded-sm {i < data.timeouts ? 'bg-white' : 'bg-white/20'}"
					title="Timeout — double-click to toggle"
					aria-label="Timeout {i + 1}"
					ondblclick={() => setTeam(t, { timeouts: i < data.timeouts ? i : i + 1 })}
				></button>
			{/each}
			<button
				type="button"
				class="ml-1 rounded-sm px-1 text-[9px] font-bold leading-tight {data.reviews > 0
					? 'bg-white text-black'
					: 'bg-white/20 text-white/40'}"
				title="Official review — double-click to toggle"
				ondblclick={() => setTeam(t, { reviews: data.reviews > 0 ? 0 : 1 })}>OR</button
			>
		</div>
		<button
			type="button"
			class="h-4 rounded px-1.5 text-[10px] font-bold tracking-widest {$leadJammer === t
				? 'bg-yellow-400 text-black'
				: 'text-white/20'}"
			title="Lead jammer — double-click to toggle"
			ondblclick={() => leadJammer.update((l) => (l === t ? null : t))}>★ LEAD</button
		>
	</div>
{/snippet}

<div
	class="flex touch-manipulation cursor-move items-start gap-2 rounded-lg bg-black/90 p-2 font-mono tabular-nums text-white shadow-lg shadow-black/30"
	onpointerdown={startDrag}
	onpointermove={moveDrag}
	onpointerup={stopDrag}
	onpointercancel={stopDrag}
	role="application"
	aria-label="Scoreboard. Drag to move."
>
	{@render teamPanel('A')}

	<div class="flex w-20 flex-col items-center gap-1 pt-0.5 sm:w-24">
		<div class="flex items-center gap-1 text-[10px] uppercase text-gray-400">
			Period
			{@render field(
				'period',
				String($scoreboard.period),
				commitCount((n) => scoreboard.update((s) => ({ ...s, period: n }))),
				'text-white'
			)}
		</div>
		{@render field(
			'periodClock',
			formatClock($scoreboard.periodClock),
			commitClock((n) => scoreboard.update((s) => ({ ...s, periodClock: n }))),
			'text-xl font-bold leading-none sm:text-2xl'
		)}
		<div class="mt-1 flex items-center gap-1 text-[10px] uppercase text-gray-400">
			Jam
			{@render field(
				'jam',
				String($scoreboard.jam),
				commitCount((n) => scoreboard.update((s) => ({ ...s, jam: n }))),
				'text-white'
			)}
		</div>
		{@render field(
			'jamClock',
			formatClock($scoreboard.jamClock),
			commitClock((n) => scoreboard.update((s) => ({ ...s, jamClock: n }))),
			'text-2xl font-bold leading-none text-yellow-300 sm:text-3xl'
		)}
	</div>

	{@render teamPanel('B')}
</div>
