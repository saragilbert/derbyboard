<script>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import '../app.css';

	// Compose the Umami tag at runtime rather than pasting the whole tag into a
	// PUBLIC_* env var: SvelteKit's dev server inlines every PUBLIC_* value as
	// JSON inside the inline bootstrap script, and a value containing a closing
	// script tag would prematurely terminate that bootstrap script and break
	// page load. Splitting into URL + website id keeps every env value safe.
	const umamiEnabled = Boolean(env.PUBLIC_UMAMI_SCRIPT_URL && env.PUBLIC_UMAMI_WEBSITE_ID);

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.catch((err) => console.warn('[sw] registration failed', err));
		}
	});
</script>

<svelte:head>
	{#if umamiEnabled}
		<script defer src={env.PUBLIC_UMAMI_SCRIPT_URL} data-website-id={env.PUBLIC_UMAMI_WEBSITE_ID}></script>
	{/if}
</svelte:head>

<slot></slot>
