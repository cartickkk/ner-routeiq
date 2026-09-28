import { supabase } from '../supabaseClient.js';

export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.reload();
}

export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : null;
}

export async function resetPassword(email, redirectToUrl) {
    const options = redirectToUrl ? { redirectTo: redirectToUrl } : {};
    const { error } = await supabase.auth.resetPasswordForEmail(email, options);
    if (error) throw error;
}

// Export supabase so app.js can use it for Google OAuth and other auth calls
export { supabase };