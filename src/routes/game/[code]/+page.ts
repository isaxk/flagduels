import { supabase, user } from "$lib/supabase/supabase.svelte";
import type { PageLoad } from "./$types";
import { error as kitError } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
    const { code } = params;
    let userData = user.current;
    if (!userData) {
        let { data: getUser } = await supabase.auth.getUser();
        userData = getUser.user;
    }

    if (!userData) {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
            console.error(error);
            return;
        }
        else {
            userData = data.user
        }
    }

    console.log('user', userData?.id)



    async function getRound(roundNumber: number, gameId: number) {
        const { data, error } = await supabase.from('game_rounds').select('*').eq('game_id', gameId).eq('round_number', roundNumber).single();
        if (error) {
            console.error(error);
            kitError(500, 'Error fetching current round')
            return;
        }
        else {
            return data;
        }
    }



    const { data, error } = await supabase.from('games').select('*').eq('game_code', code).single();

    if (data) {
        console.log(data.player1_id, userData?.id);
    }
    if (data && data.player1_id === userData?.id) {
        console.log('Player is already in game as player 1');
        const round = await getRound(data.current_round, data.id);
        return { data, host: true, round }
    }
    else if (data && data.player2_id === userData?.id) {
        console.log('Player is already in game as player 2');
        const round = await getRound(data.current_round, data.id);
        return { data: data, host: false, round }
    }
    else {
        console.log('Player is not in game');
        const { data, error: joinError } = await supabase.functions.invoke('join_game', {
            body: {
                gameCode: code,
            }
        })
        console.log('Join Game Complete')
        if (joinError) {
            console.error(joinError);
            kitError(500, 'Error joining game')
        }
        const { data: game, error } = await supabase.from('games').select('*').eq('game_code', code).single();
        const round = await getRound(game.current_round, game.id);
        return { data: game, host: false, round }


    }

}