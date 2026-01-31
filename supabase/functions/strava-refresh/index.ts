// Supabase Edge Function: Strava Token Refresh
// Refreshes expired Strava tokens server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StravaTokenResponse {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get the authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Invalid user token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get the user's current integration
        const { data: integration, error: fetchError } = await supabase
            .from("user_integrations")
            .select("*")
            .eq("user_id", user.id)
            .eq("provider", "strava")
            .single();

        if (fetchError || !integration) {
            return new Response(
                JSON.stringify({ error: "No Strava integration found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get Strava credentials
        const clientId = Deno.env.get("STRAVA_CLIENT_ID");
        const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");

        if (!clientId || !clientSecret) {
            return new Response(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Refresh the token
        const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: integration.refresh_token,
                grant_type: "refresh_token",
            }),
        });

        if (!tokenResponse.ok) {
            // If refresh fails, the integration is likely invalid
            await supabase
                .from("user_integrations")
                .delete()
                .eq("user_id", user.id)
                .eq("provider", "strava");

            return new Response(
                JSON.stringify({ error: "Token refresh failed, integration removed" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const tokenData: StravaTokenResponse = await tokenResponse.json();

        // Update tokens in database
        const { error: updateError } = await supabase
            .from("user_integrations")
            .update({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: tokenData.expires_at,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("provider", "strava");

        if (updateError) {
            console.error("Failed to update tokens:", updateError);
            return new Response(
                JSON.stringify({ error: "Failed to save refreshed tokens" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Return the new access token
        return new Response(
            JSON.stringify({
                access_token: tokenData.access_token,
                expires_at: tokenData.expires_at
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Edge function error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
