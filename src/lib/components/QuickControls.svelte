<script lang="ts">
	import {
		BarsOutline,
		CogOutline,
		EyeSlashOutline,
		LockOutline,
		UsersOutline
	} from 'flowbite-svelte-icons';
	import type { KonvaGame } from '$lib/konva/KonvaGame';
	import { boardSettings } from '$lib/stores/boardSettings';

	type Position = { x: number; y: number };

	let { game, onOpenSettings }: { game: KonvaGame; onOpenSettings: () => void } = $props();
	let dragStart = $state<Position | null>(null);
	let dragPosition = $state<Position | null>(null);
	let position = $derived(dragPosition ?? $boardSettings.quickControlsPosition);

	function toggleKeepInBounds() {
		boardSettings.update((settings) => ({ ...settings, keepInBounds: !settings.keepInBounds }));
	}

	function toggleHideOfficials() {
		const hidden = !$boardSettings.hideOfficials;
		boardSettings.update((settings) => ({ ...settings, hideOfficials: hidden }));
		game.setOfficialsHidden(hidden);
	}

	function hide() {
		boardSettings.update((settings) => ({ ...settings, quickControlsVisible: false }));
	}

	function startDrag(event: PointerEvent) {
		const panel = (event.currentTarget as HTMLElement).closest('[data-quick-controls]');
		if (!panel) return;

		const rect = panel.getBoundingClientRect();
		dragStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
		dragPosition = { x: rect.left, y: rect.top };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function moveDrag(event: PointerEvent) {
		if (!dragStart) return;
		dragPosition = {
			x: Math.max(8, Math.min(window.innerWidth - 220, event.clientX - dragStart.x)),
			y: Math.max(8, Math.min(window.innerHeight - 48, event.clientY - dragStart.y))
		};
	}

	function stopDrag() {
		const finalPosition = dragPosition;
		if (finalPosition) {
			boardSettings.update((settings) => ({ ...settings, quickControlsPosition: finalPosition }));
		}
		dragStart = null;
		dragPosition = null;
	}
</script>

<div
	data-quick-controls
	class="fixed z-40 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1.5 text-gray-700 shadow-lg shadow-black/10"
	style={position
		? `left: ${position.x}px; top: ${position.y}px`
		: 'left: max(1rem, env(safe-area-inset-left)); bottom: calc(max(1rem, env(safe-area-inset-bottom)) + 3.5rem)'}
>
	<button
		type="button"
		class="cursor-move rounded p-1 text-gray-400 hover:bg-gray-100"
		title="Drag controls"
		aria-label="Drag controls"
		onpointerdown={startDrag}
		onpointermove={moveDrag}
		onpointerup={stopDrag}
		onpointercancel={stopDrag}
	>
		<BarsOutline class="h-4 w-4" />
	</button>
	<button
		type="button"
		role="switch"
		aria-checked={!!$boardSettings.keepInBounds}
		class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium {$boardSettings.keepInBounds
			? 'bg-primary-100 text-primary-800'
			: 'hover:bg-gray-100'}"
		title="Keep players in bounds"
		onclick={toggleKeepInBounds}
	>
		<LockOutline class="h-4 w-4" />
		Bounds
	</button>
	<button
		type="button"
		role="switch"
		aria-checked={!!$boardSettings.hideOfficials}
		class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium {$boardSettings.hideOfficials
			? 'bg-primary-100 text-primary-800'
			: 'hover:bg-gray-100'}"
		title="Hide officials"
		onclick={toggleHideOfficials}
	>
		<UsersOutline class="h-4 w-4" />
		Officials
	</button>
	<button
		type="button"
		class="rounded p-1 text-gray-500 hover:bg-gray-100"
		title="Board settings"
		aria-label="Board settings"
		onclick={onOpenSettings}
	>
		<CogOutline class="h-4 w-4" />
	</button>
	<button
		type="button"
		class="rounded p-1 text-gray-500 hover:bg-gray-100"
		title="Hide controls"
		aria-label="Hide controls"
		onclick={hide}
	>
		<EyeSlashOutline class="h-4 w-4" />
	</button>
</div>