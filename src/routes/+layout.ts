import { supabase } from "$lib/supabase/supabase.svelte";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params }) => {
    const { data, error } = await supabase.from('flags').select('*');
    if (error) {
        console.error(error);
    }
    return {
        flags: data
    }
}

export const ssr = false;