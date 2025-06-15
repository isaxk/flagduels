<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { db, supabase, user } from '$lib/supabase/supabase.svelte';

	let { children } = $props();

	onMount(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (!data?.user) {
				db.signInAnom();
			}
		});
	});
</script>

<div class="max-w-screen-md mx-auto w-full">
	{#if user.current}
		{@render children()}
	{:else}
		Connecting...
	{/if}
</div>
