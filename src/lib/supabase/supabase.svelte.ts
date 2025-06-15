import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { type Database, type Tables } from '$lib/types/supabase';
import { createClient, type RealtimePostgresUpdatePayload, type SupabaseClient, type User } from '@supabase/supabase-js'

export const supabase: SupabaseClient = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export let user: { current: null | User } = $state({
    current: null
});

supabase.auth.onAuthStateChange((_, session) => {
    if (session && session.user) {

        user.current = session.user;
    } else {
        user.current = null;
    }
})

export const db = {
    signInAnom: async () => {
        await supabase.auth.signInAnonymously();
    },
    createGame: async () => {
        const { data, error } = await supabase.functions.invoke('create_game');
        if (error) {
            console.error(error);
            return;
        }
        else {
            console.log(data)
            return data.gameCode;
        }
    },
    playAgain: async (gameId: string) => {
        const { data, error } = await supabase.functions.invoke('play_again', {
            body: {
                game_id: gameId
            }
        })
        if (error) {
            console.error(error);
            return;
        }
        else {
            console.log(data)
            return data.game_code;
        }
    },
    getCurrentRound: async (gameId: string, roundNumber: number) => {
        return await supabase.from('game_rounds').select('*').eq('game_id', gameId).eq('round_number', roundNumber).single();
    },
    makeGuess: async (gameId: number, flagId: number) => {
        console.log(flagId)
        await supabase.functions.invoke('make_guess', {
            body: {
                gameId: gameId,
                guessedFlagId: flagId
            }
        })
    },
    createGameChannel: (gameId: string, callback: (payload: Tables<'games'>) => void) => {
        const channel = supabase
            .channel('game-change')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'games',
                    filter: `id=eq.${gameId}`
                },
                (payload) => {
                    callback(payload.new as Tables<'games'>);
                }).subscribe();
        return channel;
    },
    createRoundChannel: (roundId: number, callback: (payload: Tables<'game_rounds'>) => void) => {

        const channel = supabase
            .channel(roundId.toString())
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'game_rounds',
                    filter: `id=eq.${roundId}`
                },
                (payload) => {
                    console.log(payload)
                    callback(payload.new as Tables<'game_rounds'>);
                }).subscribe();
        return channel;
    }

}