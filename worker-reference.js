export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    
    // Origin ভ্যালিডেশন (ফাঁকা থাকলে বা লোকাল টেস্টের জন্য উন্মুক্ত)
    const originOk = allowed.length === 0 || !origin || origin === 'null' || allowed.includes(origin);

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed.length === 0 ? '*' : (originOk ? origin : 'null'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Vary': 'Origin'
    };

    // Preflight (OPTIONS) রিকোয়েস্ট হ্যান্ডলিং
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!originOk) {
      return new Response(JSON.stringify({ error: 'Forbidden Origin' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // এনভায়রনমেন্ট ভ্যারিয়েবল চেক
    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      return new Response(JSON.stringify({ error: 'Server misconfigured: BOT_TOKEN or CHAT_ID missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      // যদি টেক্সট ফরম্যাটে আসে তাহলেও রিসিভ করার চেষ্টা
      try {
        const rawText = await request.text();
        body = JSON.parse(rawText);
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    let text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return new Response(JSON.stringify({ error: 'Message text is empty' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // টেলিগ্রামের সীমা ৪০৯৬ অক্ষর, নিরাপদ রাখতে ৪০০০ এ ট্রাঙ্কেট করা
    if (text.length > 4000) {
      text = text.slice(0, 3950) + '\n… (অতিরিক্ত অংশ কেটে সংক্ষেপ করা হলো)';
    }

    const payload = {
      chat_id: env.CHAT_ID,
      text: text,
      disable_web_page_preview: true
    };

    if (body.parse_mode === 'HTML') {
      payload.parse_mode = 'HTML';
    }

    try {
      // টেলিগ্রাম API-তে রিকোয়েস্ট পাঠানো
      let tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let tgData = await tgRes.json();

      // HTML পার্সিং ফেইল করলে সাধারণ টেক্সট হিসেবে পুনরায় পাঠানোর ব্যাকআপ চেষ্টা
      if (!tgRes.ok && body.parse_mode === 'HTML' && tgData.description?.includes('can\'t parse entities')) {
        delete payload.parse_mode;
        tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        tgData = await tgRes.json();
      }

      if (tgRes.ok && tgData.ok) {
        return new Response(JSON.stringify({ success: true, messageId: tgData.result?.message_id }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Telegram API Error', details: tgData }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Worker fetch error', message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};