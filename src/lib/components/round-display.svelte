<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import FlagBox from './flag-box.svelte';
	import type { Tables } from '$lib/types/supabase';
	import { db, user } from '$lib/supabase/supabase.svelte';
	import { crossfade, fly, slide } from 'svelte/transition';
	import Incrementor from './incrementor.svelte';

	let {
		flagId,
		currentRound,
		game
	}: { flagId: number; currentRound: Tables<'game_rounds'>; game: Tables<'games'> } = $props();

	let countdown = $state(3);
	const currentFlag = $derived(page.data.flags?.find((f) => f.id === flagId) ?? null);

	onMount(() => {
		const interval = setInterval(() => {
			countdown -= 1;
			if (countdown === 0) {
				clearInterval(interval);
			}
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	});

	const players = $derived.by(() => {
		const userIsPlayer1 = game.player1_id === user.current?.id;

		const userScore = userIsPlayer1 ? game.player1_score : game.player2_score;
		const opponentScore = userIsPlayer1 ? game.player2_score : game.player1_score;
		const userHasGuessed = userIsPlayer1
			? currentRound.player1_guess !== null
			: currentRound.player2_guess !== null;
		const oppponentHasGuessed = userIsPlayer1
			? currentRound.player2_guess !== null
			: currentRound.player1_guess !== null;
		const userIsCorrect = userIsPlayer1
			? currentRound.player1_correct
			: currentRound.player2_correct;
		const opponentIsCorrect = userIsPlayer1
			? currentRound.player2_correct
			: currentRound.player1_correct;
		const userGuess = userIsPlayer1 ? currentRound.player1_guess : currentRound.player2_guess;
		const opponentGuess = userIsPlayer1 ? currentRound.player2_guess : currentRound.player1_guess;
		const userGuessTime = userIsPlayer1
			? currentRound.player1_guess_time_ms
			: currentRound.player2_guess_time_ms;
		const opponentGuessTime = userIsPlayer1
			? currentRound.player2_guess_time_ms
			: currentRound.player1_guess_time_ms;

		let userPointsAwarded = 0;
		let opponentPointsAwarded = 0;
		let userRemaining = Math.max(0, 5000 - (userGuessTime ?? 0));
		let opponentRemaining = Math.max(0, 5000 - (opponentGuessTime ?? 0));
		let userBonus = Math.round((userRemaining / 5000) * 1000);
		let opponentBonus = Math.round((opponentRemaining / 5000) * 1000);

		if (userHasGuessed && oppponentHasGuessed) {
			if (userIsCorrect && opponentIsCorrect) {
				if (Math.abs((userGuessTime ?? 0) - (opponentGuessTime ?? 0)) <= 500) {
					userPointsAwarded = 500 + userBonus;
					opponentPointsAwarded = 500 + opponentBonus;
				} else if ((userGuessTime ?? 0) < (opponentGuessTime ?? 0)) {
					userPointsAwarded = 1000 + userBonus;
					opponentPointsAwarded = 500 + opponentBonus;
				} else if ((opponentGuessTime ?? 0) < (userGuessTime ?? 0)) {
					userPointsAwarded = 500 + userBonus;
					opponentPointsAwarded = 1000 + opponentBonus;
				}
			} else if (userIsCorrect && !opponentIsCorrect) {
				userPointsAwarded = 1000 + userBonus;
				opponentPointsAwarded = 0;
			} else if (!userIsCorrect && opponentIsCorrect) {
				userPointsAwarded = 0;
				opponentPointsAwarded = 1000 + opponentBonus;
			}
		}

		return {
			user: {
				id: user.current?.id,
				score: userScore,
				hasGuessed: userHasGuessed,
				isCorrect: userIsCorrect,
				guess: userGuess,
				guessTime: userGuessTime,
				pointsAwarded: userPointsAwarded
			},
			opponent: {
				id: game.player1_id === user.current?.id ? game.player2_id : game.player1_id,
				score: opponentScore,
				hasGuessed: oppponentHasGuessed,
				isCorrect: opponentIsCorrect,
				guess: opponentGuess,
				guessTime: opponentGuessTime,
				pointsAwarded: opponentPointsAwarded
			}
		};
	});

	const [send, receive] = crossfade({ duration: 200 });
</script>

<div class="flex w-full items-center">
	<img
		src="https://api.dicebear.com/9.x/pixel-art/png?seed={players.user.id}"
		class="h-14 min-w-14 rounded-full"
		alt=""
	/>
	<div class="flex w-full flex-grow justify-start relative h-14">
		{#if players.user.hasGuessed && players.opponent.hasGuessed}
			<div class="absolute -bottom-12 -left-12 z-50">
				<div class="rounded-lg bg-gray-200 px-3 py-2 text-sm">
					{#if players.user.isCorrect}✅{:else}❌{/if}
					{page.data.flags?.find((f) => f.id === players.user.guess)?.name} in {players.user
						.guessTime}ms
				</div>
				<div class="absolute -top-1.5 left-2 h-4 w-4 rotate-45 bg-gray-200" />
			</div>
		{/if}
		{#if players.user.pointsAwarded}
			<div class="text-lg z-0" in:fly={{ duration: 200, x: -100 }} out:fly={{ duration: 400, x: 500 }}>
				+{players.user.pointsAwarded}
			</div>
		{/if}
	</div>
	<div class="flex gap-1 text-2xl">
		<div><Incrementor value={players.user.score ?? 0}/></div>
		<div class="translate-y-1.5 text-lg">vs</div>
		<div class="translate-y-1"><Incrementor value={players.opponent.score ?? 0}/></div>
	</div>
	<div class="relative flex w-full flex-grow justify-end h-14">
		{#if players.opponent.hasGuessed}
			<div
				class={[
					'absolute transition-all',
					players.user.hasGuessed ? '-right-12 -bottom-12' : 'bottom-2 right-3'
				]}
			>
				<div class="rounded-lg bg-gray-200 px-3 py-2 text-sm" out:send={{ key: 'opponent-guess' }}>
					{#if players.user.hasGuessed}
						{#if players.opponent.isCorrect}✅{:else}❌{/if}
						{page.data.flags?.find((f) => f.id === players.opponent.guess)?.name} in {players
							.opponent.guessTime}ms
					{:else}
						Waiting for you...
					{/if}
				</div>
				<div
					class={[
						'absolute h-4 w-4 rotate-45 bg-gray-200 transition-all',
						players.user.hasGuessed ? '-top-1.5 right-2' : '-right-1 bottom-1.5'
					]}
				></div>
			</div>
		{/if}
		{#if players.opponent.pointsAwarded}
			<div class="text-lg" in:fly={{ duration: 200, x: 100 }} out:fly={{ duration: 400, x: -400 }}>
				+{players.opponent.pointsAwarded}
			</div>
		{/if}
	</div>
	<img
		src="https://api.dicebear.com/9.x/pixel-art/png?seed={players.opponent.id}"
		class="h-14 min-w-14 rounded-full"
		alt=""
	/>
</div>

<div class="h-96">
	{#if currentRound.player1_guess && currentRound.player2_guess}
		<div class="flex items-center gap-4">
			<img
				in:receive|global={{ key: 'flag-img' }}
				out:send|global={{ key: 'flag-img' }}
				src={currentFlag.image_url}
				class="w-20"
				alt=""
			/>
			<div>{currentFlag.name}</div>
		</div>
	{:else if countdown > 0}
		{countdown}
	{:else}
		<div transition:slide={{ duration: 200 }}>
			<img
				in:receive|global={{ key: 'flag-img' }}
				out:send|global={{ key: 'flag-img' }}
				src={currentFlag.image_url}
				class="w-96"
				alt=""
			/>
		</div>
	{/if}
</div>
<FlagBox
	flags={page.data.flags}
	onSubmit={(e) => {
		db.makeGuess(currentRound.game_id, e);
	}}
/>
