//const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://ultrapropackers.in', // Default
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    const allowedOrigins = [
        'https://harikums222.github.io',
        'https://curious-crostata-2d46a4.netlify.app',
        'https://ultrapropackers.in'
    ];

    // Normalize case as browsers may send 'origin' or 'Origin'
    const requestOrigin = event.headers.origin || event.headers.Origin;

    if (allowedOrigins.includes(requestOrigin)) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
    }

    // TR0UBLESH00TING: If you get CORS errors on a new domain, 
    // uncomment the line below to allow all origins temporarily:
    // headers['Access-Control-Allow-Origin'] = '*';

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { name, phone, email, service, moving_from, moving_to, additional_info } = body;

        if (!name || !phone || !service || !moving_from || !moving_to) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        // Support multiple chat IDs separated by commas or multiple env vars
        const CHAT_IDS = [
            process.env.TELEGRAM_CHAT_ID,
            process.env.TELEGRAM_CHAT_ID_2,
            process.env.TELEGRAM_CHAT_ID_3
        ].filter(id => id && id.trim());

        if (!BOT_TOKEN || CHAT_IDS.length === 0) {
            console.error('Telegram environment variables not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Format service name for better display (e.g., home-relocation -> Home Relocation)
        const formatLabel = (slug) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        // Clean phone for links (remove spaces, etc.)
        const cleanPhone = phone.replace(/\D/g, '');
        const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'short'
        });

        const text = `
🚀 *NEW QUOTE REQUEST*
--------------------------
🕒 *Received*: ${timestamp}

👤 *Customer*: *${name}*
📞 *Phone*: *${phone}*
📧 *Email*: *${email || '-'}*

🛠️ *Service*: *${formatLabel(service)}*
📍 *Moving From*: *${moving_from}*
🏁 *Moving To*: *${moving_to}*
📝 *Notes*: _${additional_info || '-'}_

--------------------------

📱 [Call Customer](tel:${cleanPhone})
💬 [Chat on WhatsApp](https://wa.me/${waPhone})

_Source: Ultra Pro Website_
    `.trim();

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        let successCount = 0;

        // Send to all configured chat IDs
        for (const chatId of CHAT_IDS) {
            try {
                const telegramResp = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId.trim(),
                        text,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: true
                    })
                });
                if (telegramResp.ok) successCount++;
            } catch (err) {
                console.error(`Error sending to ${chatId}:`, err);
            }
        }

        if (successCount > 0) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, delivered_to: successCount })
            };
        } else {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Failed to send message to any Telegram recipients' })
            };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};


