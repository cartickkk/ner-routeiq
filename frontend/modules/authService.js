import { supabase } from '../../backend/supabaseClient.js';

// Sign Up
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

// Sign In
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

// Sign Out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.reload();
}

// Get Current User Profile / Session
export async function getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return session ? session.user : null;
}

// Forgot Password Reset
export async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/frontend/index.html',
    });
    if (error) throw error;
    return data;
}
