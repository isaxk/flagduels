import { goto } from '$app/navigation'
import { db } from '$lib/supabase/supabase.svelte'
import { redirect } from '@sveltejs/kit'

export const load = async ({ params }) => {
    db.createGame().then((res) => {
        goto(`/game/${res}`)
    })
}