import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting map: IP -> {count, resetTime}
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Phone validation regex for Algerian numbers
const ALGERIAN_PHONE_REGEX = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;

// Input validation and sanitization
interface SanitizedData {
  productName: string;
  fullName: string;
  phone: string;
  state: string;
  stateId: string;
  district: string;
  address: string;
  selectedOption: string;
  quantity: number;
  deliveryMethod: string;
}

function validateAndSanitizeInput(data: any): 
  | { valid: false; errors: string[] }
  | { valid: true; sanitized: SanitizedData } {
  const errors: string[] = [];

  // Validate product name
  if (!data.productName || typeof data.productName !== 'string') {
    errors.push('Product name is required');
  } else if (data.productName.trim().length === 0) {
    errors.push('Product name cannot be empty');
  } else if (data.productName.length > 100) {
    errors.push('Product name must be less than 100 characters');
  }

  // Validate customer name
  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.push('Full name is required');
  } else if (data.fullName.trim().length === 0) {
    errors.push('Full name cannot be empty');
  } else if (data.fullName.length > 100) {
    errors.push('Full name must be less than 100 characters');
  }

  // Validate phone number
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone number is required');
  } else if (!ALGERIAN_PHONE_REGEX.test(data.phone.trim())) {
    errors.push('Invalid Algerian phone number format');
  }

  // Validate state
  if (!data.state || typeof data.state !== 'string' || data.state.trim().length === 0) {
    errors.push('State is required');
  }

  // Validate state ID
  if (!data.stateId || typeof data.stateId !== 'string' || data.stateId.trim().length === 0) {
    errors.push('State ID is required');
  }

  // Validate district
  if (!data.district || typeof data.district !== 'string' || data.district.trim().length === 0) {
    errors.push('District is required');
  }

  // Validate address
  if (!data.address || typeof data.address !== 'string') {
    errors.push('Address is required');
  } else if (data.address.trim().length < 5) {
    errors.push('Address must be at least 5 characters');
  } else if (data.address.length > 200) {
    errors.push('Address must be less than 200 characters');
  }

  // Validate selected option
  if (!data.selectedOption || typeof data.selectedOption !== 'string') {
    errors.push('Product option is required');
  }

  // Validate quantity
  if (!data.quantity || typeof data.quantity !== 'number') {
    errors.push('Quantity is required');
  } else if (data.quantity < 1 || data.quantity > 100) {
    errors.push('Quantity must be between 1 and 100');
  }

  // Validate delivery method
  if (!data.deliveryMethod || typeof data.deliveryMethod !== 'string') {
    errors.push('Delivery method is required');
  } else if (!['home', 'desk'].includes(data.deliveryMethod)) {
    errors.push('Invalid delivery method');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize inputs
  return {
    valid: true,
    sanitized: {
      productName: data.productName.trim().slice(0, 100),
      fullName: data.fullName.trim().slice(0, 100),
      phone: data.phone.trim(),
      state: data.state.trim().slice(0, 50),
      stateId: data.stateId.trim().slice(0, 10),
      district: data.district.trim().slice(0, 100),
      address: data.address.trim().slice(0, 200),
      selectedOption: data.selectedOption.trim(),
      quantity: Math.floor(Math.min(Math.max(data.quantity, 1), 100)),
      deliveryMethod: data.deliveryMethod.trim(),
    }
  };
}

// Rate limiting check
function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const remainingTime = Math.ceil((entry.resetTime - now) / 60000);
    return {
      allowed: false,
      message: `Rate limit exceeded. Please try again in ${remainingTime} minutes.`
    };
  }

  entry.count++;
  return { allowed: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting based on IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();
    console.log('Received order submission request');

    // Validate and sanitize input
    const validation = validateAndSanitizeInput(requestData);
    if (!validation.valid) {
      console.log('Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedData = validation.sanitized;

    // Generate secure order reference using crypto
    const orderReference = `ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store order in database
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        order_reference: orderReference,
        customer_name: sanitizedData.fullName,
        phone: sanitizedData.phone,
        state: sanitizedData.state,
        district: sanitizedData.district,
        selected_option: sanitizedData.selectedOption,
        quantity: sanitizedData.quantity,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order stored successfully:', orderReference);

    // Send TikTok conversion event server-side
    const tiktokPixelId = Deno.env.get('TIKTOK_PIXEL_ID');
    const tiktokAccessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');

    if (tiktokPixelId && tiktokAccessToken) {
      const tiktokEventPayload = {
        pixel_code: tiktokPixelId,
        event: 'CompletePayment',
        event_time: Math.floor(Date.now() / 1000),
        event_id: orderReference,
        event_source_id: tiktokPixelId,
        properties: {
          content_id: orderReference,
          content_name: sanitizedData.productName,
          value: 2990 * sanitizedData.quantity,
          currency: 'DZD',
          quantity: sanitizedData.quantity
        },
        context: {
          user_agent: req.headers.get('user-agent') || '',
          ip: clientIp
        }
      };

      console.log('Sending TikTok conversion event:', tiktokEventPayload.event_id);

      fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': tiktokAccessToken
        },
        body: JSON.stringify(tiktokEventPayload)
      }).then(response => {
        console.log('TikTok API response status:', response.status);
        return response.json();
      }).then(data => {
        console.log('TikTok API response:', JSON.stringify(data));
      }).catch(error => {
        console.error('TikTok API call failed:', error.message);
      });
    } else {
      console.warn('TikTok credentials not configured');
    }

    // Send to webhook asynchronously
    const webhookUrl = 'https://n8n-n8n.2ufl9p.easypanel.host/webhook-test/c9977864-c285-4720-8a74-799d52258dfd';
    const webhookPayload = {
      orderReference,
      productName: sanitizedData.productName,
      fullName: sanitizedData.fullName,
      phone: sanitizedData.phone,
      state: sanitizedData.state,
      stateId: sanitizedData.stateId,
      district: sanitizedData.district,
      address: sanitizedData.address,
      selectedOption: sanitizedData.selectedOption,
      quantity: sanitizedData.quantity,
      deliveryMethod: sanitizedData.deliveryMethod,
      timestamp: new Date().toISOString()
    };

    console.log('Sending to webhook:', webhookUrl);
    console.log('Webhook payload:', JSON.stringify(webhookPayload));
    
    // Don't wait for webhook response to avoid blocking the user
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    }).then(response => {
      console.log('Webhook response status:', response.status);
      return response.text();
    }).then(body => {
      console.log('Webhook response body:', body);
    }).catch(error => {
      console.error('Webhook call failed:', error.message);
    });

    // Return success response immediately
    return new Response(
      JSON.stringify({ 
        success: true, 
        orderReference,
        message: 'Order submitted successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
