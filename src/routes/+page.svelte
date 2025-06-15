<script lang="ts">
	import { goto } from '$app/navigation';
	import { db } from '$lib/supabase/supabase.svelte';

	let {data} = $props();
</script>

<a href="/create">Create game</a>

<pre>
	{JSON.stringify(data.flags)}
</pre>