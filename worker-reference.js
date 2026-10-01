export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    
    // file:// বা লোকালহোস্টে টেস্ট করার জন্য origin না থাকলেও অনুমোদন দেওয়া
    const originOk = allowed.length === 0 || !origin || origin === 'null' || allowed.includes(origin);

    const cors = {
      'Access-Control-Allow-Origin': allowed.length === 0 ? '*' : (originOk ? origin : 'null'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    if (!originOk) return new Response('Forbidden', { status: 403, headers: cors });

    let body;
    try { 
      body = await request.json(); 
    } catch (e) { 
      return new Response('Bad JSON', { status: 400, headers: cors }); 
    }

    const text = typeof body.text === 'string' ? body.text : '';
    if (!text || text.length > 3900) return new Response('Invalid text', { status: 400, headers: cors });

    // টেলিগ্রামে মেসেজ পাঠানো
    const tg = await fetch('https://api.telegram.org/bot' + env.BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text: text,
        parse_mode: body.parse_mode === 'HTML' ? 'HTML' : undefined,
        disable_web_page_preview: true
      })
    });

    // টেলিগ্রামের রেসপন্স রিড করা
    const tgData = await tg.text();

    if (tg.ok) {
      return new Response('ok', { status: 200, headers: cors });
    } else {
      // সমস্যা হলে টেলিগ্রামের আসল এররটি ফিরিয়ে দিবে
      return new Response(tgData, { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  }
};