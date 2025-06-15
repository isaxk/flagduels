<script lang="ts">
	import { Tween } from "svelte/motion";

	let { value }: { value: number } = $props();

    const t = new Tween(value, {duration:400});

    $effect(()=>{
        t.set(value);
    })
</script>

{Math.round(t.current)}
