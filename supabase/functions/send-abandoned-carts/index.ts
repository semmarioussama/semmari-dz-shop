import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Algerian states data
const algerianStates = [
  { id: '1', name: 'Adrar' },
  { id: '2', name: 'Chlef' },
  { id: '3', name: 'Laghouat' },
  { id: '4', name: 'Oum El Bouaghi' },
  { id: '5', name: 'Batna' },
  { id: '6', name: 'Béjaïa' },
  { id: '7', name: 'Biskra' },
  { id: '8', name: 'Béchar' },
  { id: '9', name: 'Blida' },
  { id: '10', name: 'Bouira' },
  { id: '11', name: 'Tamanrasset' },
  { id: '12', name: 'Tébessa' },
  { id: '13', name: 'Tlemcen' },
  { id: '14', name: 'Tiaret' },
  { id: '15', name: 'Tizi Ouzou' },
  { id: '16', name: 'Alger' },
  { id: '17', name: 'Djelfa' },
  { id: '18', name: 'Jijel' },
  { id: '19', name: 'Sétif' },
  { id: '20', name: 'Saïda' },
  { id: '21', name: 'Skikda' },
  { id: '22', name: 'Sidi Bel Abbès' },
  { id: '23', name: 'Annaba' },
  { id: '24', name: 'Guelma' },
  { id: '25', name: 'Constantine' },
  { id: '26', name: 'Médéa' },
  { id: '27', name: 'Mostaganem' },
  { id: '28', name: "M'Sila" },
  { id: '29', name: 'Mascara' },
  { id: '30', name: 'Ouargla' },
  { id: '31', name: 'Oran' },
  { id: '32', name: 'El Bayadh' },
  { id: '33', name: 'Illizi' },
  { id: '34', name: 'Bordj Bou Arreridj' },
  { id: '35', name: 'Boumerdès' },
  { id: '36', name: 'El Tarf' },
  { id: '37', name: 'Tindouf' },
  { id: '38', name: 'Tissemsilt' },
  { id: '39', name: 'El Oued' },
  { id: '40', name: 'Khenchela' },
  { id: '41', name: 'Souk Ahras' },
  { id: '42', name: 'Tipaza' },
  { id: '43', name: 'Mila' },
  { id: '44', name: 'Aïn Defla' },
  { id: '45', name: 'Naâma' },
  { id: '46', name: 'Aïn Témouchent' },
  { id: '47', name: 'Ghardaïa' },
  { id: '48', name: 'Relizane' },
  { id: '49', name: 'Timimoun' },
  { id: '50', name: 'Bordj Badji Mokhtar' },
  { id: '51', name: 'Ouled Djellal' },
  { id: '52', name: 'Béni Abbès' },
  { id: '53', name: 'In Salah' },
  { id: '54', name: 'In Guezzam' },
  { id: '55', name: 'Touggourt' },
  { id: '56', name: 'Djanet' },
  { id: '57', name: "El M'Ghair" },
  { id: '58', name: 'El Meniaa' },
];

// Delivery tariffs data
const deliveryTariffs = [
  { stateId: '16', deskPrice: 400, homePrice: 600 },
  { stateId: '9', deskPrice: 500, homePrice: 700 },
  { stateId: '35', deskPrice: 500, homePrice: 700 },
  { stateId: '42', deskPrice: 500, homePrice: 700 },
  { stateId: '44', deskPrice: 500, homePrice: 700 },
  { stateId: '10', deskPrice: 550, homePrice: 750 },
  { stateId: '15', deskPrice: 550, homePrice: 750 },
  { stateId: '26', deskPrice: 550, homePrice: 750 },
  { stateId: '6', deskPrice: 600, homePrice: 800 },
  { stateId: '19', deskPrice: 600, homePrice: 800 },
  { stateId: '34', deskPrice: 600, homePrice: 800 },
  { stateId: '43', deskPrice: 600, homePrice: 800 },
  { stateId: '18', deskPrice: 650, homePrice: 850 },
  { stateId: '21', deskPrice: 650, homePrice: 850 },
  { stateId: '2', deskPrice: 600, homePrice: 800 },
  { stateId: '27', deskPrice: 600, homePrice: 800 },
  { stateId: '48', deskPrice: 600, homePrice: 800 },
  { stateId: '31', deskPrice: 600, homePrice: 800 },
  { stateId: '29', deskPrice: 650, homePrice: 850 },
  { stateId: '22', deskPrice: 650, homePrice: 850 },
  { stateId: '46', deskPrice: 650, homePrice: 850 },
  { stateId: '13', deskPrice: 700, homePrice: 900 },
  { stateId: '14', deskPrice: 700, homePrice: 900 },
  { stateId: '38', deskPrice: 700, homePrice: 900 },
  { stateId: '20', deskPrice: 750, homePrice: 950 },
  { stateId: '23', deskPrice: 700, homePrice: 900 },
  { stateId: '36', deskPrice: 700, homePrice: 900 },
  { stateId: '24', deskPrice: 750, homePrice: 950 },
  { stateId: '41', deskPrice: 750, homePrice: 950 },
  { stateId: '25', deskPrice: 600, homePrice: 800 },
  { stateId: '28', deskPrice: 700, homePrice: 900 },
  { stateId: '17', deskPrice: 700, homePrice: 900 },
  { stateId: '3', deskPrice: 800, homePrice: 1000 },
  { stateId: '32', deskPrice: 800, homePrice: 1000 },
  { stateId: '45', deskPrice: 850, homePrice: 1050 },
  { stateId: '4', deskPrice: 700, homePrice: 900 },
  { stateId: '40', deskPrice: 750, homePrice: 950 },
  { stateId: '5', deskPrice: 700, homePrice: 900 },
  { stateId: '12', deskPrice: 800, homePrice: 1000 },
  { stateId: '7', deskPrice: 750, homePrice: 950 },
  { stateId: '39', deskPrice: 800, homePrice: 1000 },
  { stateId: '57', deskPrice: 850, homePrice: 1050 },
  { stateId: '55', deskPrice: 850, homePrice: 1050 },
  { stateId: '30', deskPrice: 900, homePrice: 1100 },
  { stateId: '47', deskPrice: 900, homePrice: 1100 },
  { stateId: '58', deskPrice: 950, homePrice: 1150 },
  { stateId: '8', deskPrice: 1000, homePrice: 1200 },
  { stateId: '52', deskPrice: 1050, homePrice: 1250 },
  { stateId: '1', deskPrice: 1100, homePrice: 1300 },
  { stateId: '49', deskPrice: 1150, homePrice: 1350 },
  { stateId: '11', deskPrice: 1500, homePrice: 1700 },
  { stateId: '33', deskPrice: 1500, homePrice: 1700 },
  { stateId: '56', deskPrice: 1550, homePrice: 1750 },
  { stateId: '53', deskPrice: 1600, homePrice: 1800 },
  { stateId: '54', deskPrice: 1650, homePrice: 1850 },
  { stateId: '50', deskPrice: 1700, homePrice: 1900 },
  { stateId: '37', deskPrice: 1400, homePrice: 1600 },
  { stateId: '51', deskPrice: 850, homePrice: 1050 },
];

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

    // Find abandoned carts older than 5 hours that haven't been sent and order wasn't completed
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    
    const { data: abandonedCarts, error: fetchError } = await supabaseClient
      .from('abandoned_carts')
      .select('*')
      .eq('webhook_sent', false)
      .eq('order_completed', false)
      .lt('created_at', fiveHoursAgo);

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
        // Find state ID from state name
        const stateData = algerianStates.find(s => s.name === cart.state);
        const stateId = stateData?.id || null;
        
        // Find delivery prices for the state
        const tariff = stateId ? deliveryTariffs.find(t => t.stateId === stateId) : null;
        
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
            desk_delivery_price: tariff?.deskPrice || null,
            home_delivery_price: tariff?.homePrice || null,
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