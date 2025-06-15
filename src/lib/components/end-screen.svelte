<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { db } from '$lib/supabase/supabase.svelte';

	let { players, host, gameId } = $props();
</script>

<div class="flex justify-center pt-3">
	<div>
		{#if players.user.score > players.opponent.score}
			<div class="text-3xl font-medium">You won!</div>
		{:else if players.user.score < players.opponent.score}
			<div class="text-3xl font-medium">You lost!</div>
		{:else}
			<div class="text-3xl font-medium">It's a draw!</div>
		{/if}
	</div>
	{#if host}
		<button
			onclick={async () => {
				const code = await db.playAgain(gameId);
				goto(`/game/${code}`, { invalidateAll: true, replaceState: true })
                invalidateAll();
			}}>Play again</button
		>
	{:else}
		The host can start a new game.
		<a href="/">Exit</a>
	{/if}
</div>
