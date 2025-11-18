import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: 3 abandoned orders per IP per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ABANDONED_PER_WINDOW = 3;

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= MAX_ABANDONED_PER_WINDOW) {
    return { 
      allowed: false, 
      message: `Rate limit exceeded. Maximum ${MAX_ABANDONED_PER_WINDOW} abandoned orders per hour.` 
    };
  }

  entry.count++;
  return { allowed: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get IP address
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") ||
               "unknown";

    // Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      console.log('Rate limit exceeded for IP:', ip);
      return new Response(
        JSON.stringify({ error: rateCheck.message }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await req.json();

    // Validate that at least some form data exists
    if (!data.fullName && !data.phone && !data.state && !data.district) {
      return new Response(
        JSON.stringify({ error: "No form data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get webhook URL from environment
    const webhookUrl = Deno.env.get("ABANDONED_ORDER_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("ABANDONED_ORDER_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward to n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!webhookResponse.ok) {
      console.error("Webhook delivery failed:", webhookResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to send webhook" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Abandoned order tracked successfully from IP:", ip);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
