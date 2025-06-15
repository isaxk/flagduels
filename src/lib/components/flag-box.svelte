<script lang="ts">
	let { flags, onSubmit } = $props();

	import Fuse from 'fuse.js';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';

	let fuse = new Fuse(flags, {
		keys: ['shorthand', 'name'],
		threshold: 0.2
	});

	let value = $state('');

	const results = $derived(fuse.search(value));
</script>

<div class="relative">
	<form
		class="relative flex h-13 overflow-hidden rounded-xl border border-zinc-300"
		onsubmit={(e) => {
			e.preventDefault();
			if (results.length > 0) {
				onSubmit(results[0].item.id);
				setTimeout(() => {
					value = '';
				}, 200);
			}
		}}
	>
		<input
			class="w-full rounded-l-xl border border-blue-500 p-3 transition-all outline-none focus:border-2"
			type="text"
			bind:value
		/>
		<button type="submit" class="bg-blue-500 px-5 text-white">Next</button>
	</form>
	{#if results && results.length}
		<div
			transition:slide={{duration:200}}
			class="absolute bottom-12 left-0 z-50 flex w-52 flex-col-reverse overflow-hidden bg-white p-4"
		>
			{#each results.slice(0, 5) as result, i (result.item.id)}
				<button
					onclick={() => {
						onSubmit(result.item.id);
						value = '';
					}}
					transition:slide={{ duration: 200 }}
				>
					{result.item.name}
				</button>
			{/each}
		</div>
	{/if}
</div>
