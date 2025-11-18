import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting abandoned cart check...');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the webhook URL from environment
    const webhookUrl = Deno.env.get('ABANDONED_ORDER_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('ABANDONED_ORDER_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find abandoned carts older than 1 hour that haven't been sent and order wasn't completed
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: abandonedCarts, error: fetchError } = await supabaseClient
      .from('abandoned_carts')
      .select('*')
      .eq('webhook_sent', false)
      .eq('order_completed', false)
      .lt('created_at', oneHourAgo);

    if (fetchError) {
      console.error('Error fetching abandoned carts:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch abandoned carts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${abandonedCarts?.length || 0} abandoned carts to process`);

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No abandoned carts to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each abandoned cart
    const results = [];
    for (const cart of abandonedCarts) {
      try {
        // Send to webhook
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: cart.session_id,
            customer_name: cart.customer_name,
            phone: cart.phone,
            state: cart.state,
            district: cart.district,
            address: cart.address,
            selected_option: cart.selected_option,
            quantity: cart.quantity,
            delivery_method: cart.delivery_method,
            ttclid: cart.ttclid,
            abandoned_at: cart.created_at,
            time_elapsed_hours: Math.round((Date.now() - new Date(cart.created_at).getTime()) / (1000 * 60 * 60))
          })
        });

        if (webhookResponse.ok) {
          // Mark as sent in database
          await supabaseClient
            .from('abandoned_carts')
            .update({
              webhook_sent: true,
              webhook_sent_at: new Date().toISOString()
            })
            .eq('id', cart.id);

          console.log(`Successfully sent abandoned cart ${cart.session_id} to webhook`);
          results.push({ session_id: cart.session_id, status: 'sent' });
        } else {
          console.error(`Failed to send webhook for cart ${cart.session_id}:`, await webhookResponse.text());
          results.push({ session_id: cart.session_id, status: 'failed' });
        }
      } catch (error) {
        console.error(`Error processing cart ${cart.session_id}:`, error);
        results.push({ session_id: cart.session_id, status: 'error', error: String(error) });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Abandoned carts processed',
        total: abandonedCarts.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-abandoned-carts function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});