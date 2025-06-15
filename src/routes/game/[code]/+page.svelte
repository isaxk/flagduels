<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import EndScreen from '$lib/components/end-screen.svelte';
	import FlagBox from '$lib/components/flag-box.svelte';
	import Incrementor from '$lib/components/incrementor.svelte';
	import RoundDisplay from '$lib/components/round-display.svelte';
	import { db, supabase, user } from '$lib/supabase/supabase.svelte.js';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import { onMount, untrack } from 'svelte';
	import { crossfade, fade, fly } from 'svelte/transition';

	let { data } = $props();

	const [send, receive] = crossfade({ duration: 200 });

	let game = $derived(data.data);
	let currentRound = $derived(data.round);
	const currentFlag = $derived(data.flags?.find((f) => f.id === game.current_flag_id) ?? null);

	let roundChannel: RealtimeChannel | null = null;

	$effect(() => {
		if (game.status === 'in_progress' && game.current_round <= game.total_rounds) {
			roundChannel?.unsubscribe();
			db.getCurrentRound(game.id, game.current_round || 0).then(({ data }) => {
				currentRound = data;
				console.log('getCurrentRound', data)
				roundChannel = db.createRoundChannel(data.id, (payload) => {
					currentRound = payload;
				});
				console.log(roundChannel)
			});
		}
		return () => {
			roundChannel?.unsubscribe();
		}
	});

	$effect(() => {
		const gameChannel = db.createGameChannel(game.id, async (payload) => {
			untrack(async () => {
				console.log(payload);

				if (payload.play_again_code) {
					goto(`/game/${payload.play_again_code}`, { invalidateAll: true }).then(() => {
						invalidateAll();
					});
				} else {
					game = payload;
				}
			});
		});

		return () => {
			gameChannel.unsubscribe();
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
</script>

{#if game.status === 'waiting'}
	<div class="flex w-full items-center p-5">
		<img
			src="https://api.dicebear.com/9.x/pixel-art/png?seed={user.current?.id}"
			class="h-14 min-w-14 rounded-full"
			alt=""
		/>
		<div class="flex-grow"></div>
		<div>Waiting for opponent to join...</div>
	</div>
{:else if game.status === 'in_progress' || game.status === 'completed'}
	<div class="flex w-full items-center p-5">
		<img
			src="https://api.dicebear.com/9.x/pixel-art/png?seed={players.user.id}"
			class="h-14 min-w-14 rounded-full"
			alt=""
		/>
		<div class="relative flex h-14 w-full flex-grow justify-start">
			{#if players.user.hasGuessed && game.status === 'in_progress'}
				<div
					in:fly={{ duration: 200, y: -100 }}
					out:fly={{ duration: 200, y: -100 }}
					class={[
						'absolute transition-all',
						players.opponent.hasGuessed ? '-bottom-20 -left-12' : 'bottom-2 left-3'
					]}
				>
					<div class="z-20 rounded-lg bg-gray-200 px-3 py-2 text-sm">
						{#if players.opponent.hasGuessed}
							<div class="text-xl">
								{#if players.user.isCorrect}✅{:else}❌{/if}
								{data.flags?.find((f) => f.id === players.user.guess)?.name}
							</div>
							in {players.user.guessTime}ms
						{:else}
							Waiting...
						{/if}
					</div>
					<div
						class={[
							'absolute -z-10 h-4 w-4 rotate-45 bg-gray-200 transition-all',
							players.opponent.hasGuessed ? '-top-1.5 left-2' : 'bottom-2 -left-1'
						]}
					></div>
				</div>
			{/if}
			{#if players.user.pointsAwarded && game.status === 'in_progress'}
				<div
					class="z-0 text-lg"
					in:fly={{ duration: 200, x: -100 }}
					out:fly={{ duration: 400, x: 500 }}
				>
					+{players.user.pointsAwarded}
				</div>
			{/if}
		</div>
		<div class="flex gap-1" in:fly={{ duration: 200, y: -100 }}>
			<div
				class={[
					'text-2xl/5 transition-all',
					players.user.score > players.opponent.score ? '-translate-y-0.5' : 'translate-y-0.5'
				]}
			>
				<Incrementor value={players.user.score ?? 0} />
			</div>
			<div class="translate-y-0.5 text-lg/4">vs</div>
			<div
				class={[
					'text-2xl/5 transition-all',
					players.user.score > players.opponent.score ? 'translate-y-0.5' : '-translate-y-0.5'
				]}
			>
				<Incrementor value={players.opponent.score ?? 0} />
			</div>
		</div>
		<div class="relative flex h-14 w-full flex-grow justify-end">
			{#if players.opponent.hasGuessed && game.status === 'in_progress'}
				<div
					in:fly={{ duration: 200, y: -100 }}
					out:fly={{ duration: 200, y: -100 }}
					class={[
						'absolute transition-all',
						players.user.hasGuessed ? '-right-12 -bottom-20' : 'right-3 bottom-2'
					]}
				>
					<div
						class="rounded-lg bg-gray-200 px-3 py-2 text-sm"
						out:send={{ key: 'opponent-guess' }}
					>
						{#if players.user.hasGuessed}
							<div class="text-xl">
								{#if players.opponent.isCorrect}✅{:else}❌{/if}
								{data.flags?.find((f) => f.id === players.opponent.guess)?.name}
							</div>
							in {players.opponent.guessTime}ms
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
			{#if players.opponent.pointsAwarded && game.status === 'in_progress'}
				<div
					class="text-lg"
					in:fly={{ duration: 200, x: 100 }}
					out:fly={{ duration: 400, x: -400 }}
				>
					+{players.opponent.pointsAwarded}
				</div>
			{/if}
		</div>
		<img
			in:fly={{ duration: 200, y: -100 }}
			src="https://api.dicebear.com/9.x/pixel-art/png?seed={players.opponent.id}"
			class="h-14 min-w-14 rounded-full"
			alt=""
		/>
	</div>
{/if}

{#if game.status === 'waiting'}
	<div class="text-4xl">{data.data.game_code}</div>
	Waiting for opponent to join...
{:else if game.status === 'in_progress' && game.current_round <= game.total_rounds}
	<img src={currentFlag.image_url} class="w-96" alt="" in:fly={{ duration: 200, y: -100 }} />
	<div in:fly={{ duration: 200, delay: 50, y: -100 }}>
		<FlagBox
			flags={data.flags}
			onSubmit={(e) => {
				db.makeGuess(game.id, e);
			}}
		/>
	</div>
{:else if game.status === 'completed'}
	<EndScreen host={data.host} {players} gameId={game.id} />
{/if}

<!-- {user.current?.id}

<pre>
    {JSON.stringify(game, null, 2)}
</pre>

{#if currentRound}
	<pre>
		{JSON.stringify(currentRound, null, 2)}
	</pre>
{/if} -->
