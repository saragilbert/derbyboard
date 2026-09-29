<script lang="ts">
	import { Modal } from 'flowbite-svelte';
	import { boardSettings } from '$lib/stores/boardSettings';
	import type { PackMethod } from '$lib/trackMath';
	import type { KonvaGame } from '$lib/konva/KonvaGame';
	import { DEFAULT_PALETTE, type Palette } from '$lib/constants';

	let { game }: { game: KonvaGame } = $props();
	let isOpen = $state(false);

	// Imperative entry point used by the Menu's "Board settings" item.
	export function open() {
		isOpen = true;
	}

	const options: { value: PackMethod; label: string; hint: string }[] = [
		{ value: 'sector', label: 'Sector', hint: 'Hip distance measured along the track.' },
		{
			value: 'rectangle',
			label: 'Rectangle',
			hint: 'Official WFTDA perpendicular method — more accurate through the turns.'
		}
	];

	function choose(method: PackMethod) {
		boardSettings.update((s) => ({ ...s, packMethod: method }));
		game.refreshPack();
	}

	const colorGroups: { title: string; fields: { key: keyof Palette; label: string }[] }[] = [
		{
			title: 'Team A',
			fields: [
				{ key: 'teamAPrimary', label: 'Primary' },
				{ key: 'teamASecondary', label: 'Secondary' }
			]
		},
		{
			title: 'Team B',
			fields: [
				{ key: 'teamBPrimary', label: 'Primary' },
				{ key: 'teamBSecondary', label: 'Secondary' }
			]
		},
		{
			title: 'Track',
			fields: [
				{ key: 'trackSurface', label: 'Surface' },
				{ key: 'trackBoundaries', label: 'Boundaries' },
				{ key: 'tenFeetLines', label: '10 ft lines' }
			]
		}
	];

	let palette = $derived<Palette>({ ...DEFAULT_PALETTE, ...$boardSettings.palette });

	function setColor(key: keyof Palette, value: string) {
		const next = { ...palette, [key]: value };
		boardSettings.update((s) => ({ ...s, palette: next }));
		game.applyColors(next);
	}

	function resetColors() {
		boardSettings.update((s) => ({ ...s, palette: undefined }));
		game.applyColors();
	}

	function toggleKeepInBounds() {
		boardSettings.update((s) => ({ ...s, keepInBounds: !s.keepInBounds }));
	}

	function toggleHideNews() {
		boardSettings.update((s) => ({ ...s, hideNews: s.hideNews === false }));
	}

	function toggleHideOfficials() {
		const hidden = !$boardSettings.hideOfficials;
		boardSettings.update((s) => ({ ...s, hideOfficials: hidden }));
		game.setOfficialsHidden(hidden);
	}
</script>

{#snippet toggle(label: string, hint: string, checked: boolean, onclick: () => void)}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		class="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-primary-50"
		{onclick}
	>
		<span>
			<span class="block text-sm font-medium text-gray-800">{label}</span>
			<span class="block text-xs text-gray-500">{hint}</span>
		</span>
		<span
			class="relative h-5 w-9 flex-none rounded-full transition-colors {checked
				? 'bg-primary-500'
				: 'bg-gray-300'}"
		>
			<span
				class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all {checked
					? 'left-[1.125rem]'
					: 'left-0.5'}"
			></span>
		</span>
	</button>
{/snippet}

<Modal bind:open={isOpen} size="sm" classes={{ close: 'hover:bg-primary-200' }}>
	<div class="px-5 pb-2 pt-4">
		<h2 class="mb-4 text-lg font-semibold text-gray-800">Board settings</h2>

		<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
			Pack measuring method
		</h3>
		<div class="space-y-2">
			{#each options as opt (opt.value)}
				<button
					type="button"
					class="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors {$boardSettings.packMethod === opt.value
						? 'border-primary-400 bg-primary-100'
						: 'border-gray-200 bg-white hover:bg-primary-50'}"
					onclick={() => choose(opt.value)}
				>
					<span
						class="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full border-2 {$boardSettings.packMethod === opt.value
							? 'border-primary-500'
							: 'border-gray-300'}"
					>
						{#if $boardSettings.packMethod === opt.value}
							<span class="h-2 w-2 rounded-full bg-primary-500"></span>
						{/if}
					</span>
					<span>
						<span class="block text-sm font-medium text-gray-800">{opt.label}</span>
						<span class="block text-xs text-gray-500">{opt.hint}</span>
					</span>
				</button>
			{/each}
		</div>

		<h3 class="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-gray-500">Players</h3>
		<div class="space-y-2">
			{@render toggle(
				'Keep players in bounds',
				'Skaters stay on the track surface when moved.',
				!!$boardSettings.keepInBounds,
				toggleKeepInBounds
			)}
			{@render toggle(
				'Hide officials',
				'Hide the striped skating officials.',
				!!$boardSettings.hideOfficials,
				toggleHideOfficials
			)}
		</div>

		<h3 class="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-gray-500">Interface</h3>
		<div class="space-y-2">
			{@render toggle(
				'Hide news',
				'Hide the News button.',
				$boardSettings.hideNews !== false,
				toggleHideNews
			)}
		</div>

		<div class="mb-2 mt-5 flex items-center justify-between">
			<h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Colors</h3>
			<button
				type="button"
				class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-primary-50"
				onclick={resetColors}
			>
				Reset
			</button>
		</div>
		<div class="space-y-3">
			{#each colorGroups as group (group.title)}
				<div class="rounded-lg border border-gray-200 p-3">
					<span class="mb-2 block text-sm font-medium text-gray-800">{group.title}</span>
					<div class="flex flex-wrap gap-4">
						{#each group.fields as field (field.key)}
							<label class="flex items-center gap-2 text-xs text-gray-600">
								<input
									type="color"
									class="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
									value={palette[field.key]}
									oninput={(e) => setColor(field.key, e.currentTarget.value)}
								/>
								{field.label}
							</label>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</Modal>
