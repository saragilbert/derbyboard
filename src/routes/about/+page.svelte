<script lang="ts">
	import { base } from '$app/paths';
	import { marked } from 'marked';
	import readme from '../../../README.md?raw';

	// README is first-party content bundled at build time, so no sanitizing needed.
	const html = marked.parse(readme, { async: false });
</script>

<svelte:head>
	<title>About – Derbyboard</title>
</svelte:head>

<div class="h-[100dvh] w-[100dvw] overflow-y-auto bg-white">
	<div class="mx-auto max-w-3xl px-4 py-6">
		<a href="{base}/" class="text-sm text-primary-700 hover:underline">← Back to board</a>

		<aside class="my-6 rounded-lg border border-primary-300 bg-primary-50 p-4 text-sm text-gray-800">
			<p class="font-semibold">Original developer</p>
			<p class="mt-1">
				Derbyboard was created by
				<a class="underline" href="https://github.com/ruihildt" target="_blank" rel="noopener"
					>Rui Hildt</a
				>. This is an unofficial fork and all credit for the original project belongs to them.
				Original repository:
				<a
					class="underline"
					href="https://github.com/ruihildt/derbyboard"
					target="_blank"
					rel="noopener">ruihildt/derbyboard</a
				>. Licensed under the AGPL-3.0.
			</p>
		</aside>

		<article class="prose max-w-none">
			{@html html}
		</article>
	</div>
</div>
