// Supabase Edge Function: Strava Token Exchange
// This keeps the client_secret secure on the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenRequest {
    code: string;
    redirect_uri: string;
}

interface StravaTokenResponse {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
    athlete: Record<string, unknown>;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get the authorization header to identify the user
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Initialize Supabase client with the user's token
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

        // Parse request body
        const { code, redirect_uri }: TokenRequest = await req.json();
        if (!code || !redirect_uri) {
            return new Response(
                JSON.stringify({ error: "Missing code or redirect_uri" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get Strava credentials from Supabase secrets
        const clientId = Deno.env.get("STRAVA_CLIENT_ID");
        const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");

        if (!clientId || !clientSecret) {
            console.error("Missing Strava credentials in environment");
            return new Response(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Exchange code for tokens with Strava
        console.log("Exchanging code for Strava tokens...");
        const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: redirect_uri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}));
            console.error("Strava token exchange failed with status:", tokenResponse.status);
            console.error("Strava error data:", JSON.stringify(errorData));
            return new Response(
                JSON.stringify({
                    error: "Failed to exchange token with Strava",
                    details: errorData,
                    status: tokenResponse.status
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const tokenData: StravaTokenResponse = await tokenResponse.json();

        // Save tokens to user_integrations table
        const { error: upsertError } = await supabase
            .from("user_integrations")
            .upsert({
                user_id: user.id,
                provider: "strava",
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: tokenData.expires_at,
                athlete_data: tokenData.athlete,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

        if (upsertError) {
            console.error("Failed to save tokens:", upsertError);
            return new Response(
                JSON.stringify({ error: "Failed to save tokens" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
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
