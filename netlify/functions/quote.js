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
        const { name, phone, email, service, moving_date, moving_from, moving_to, additional_info, message } = body;

        if (!name || !phone || !service || !moving_date || !moving_from || !moving_to) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const notesText = additional_info || message || '-';

        // Google Sheets Integration
        const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        if (GOOGLE_SHEET_WEBHOOK) {
            try {
                // Submit asynchronously without blocking the Telegram message
                await fetch(GOOGLE_SHEET_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        phone,
                        email: email || '',
                        service,
                        moving_date,
                        moving_from,
                        moving_to,
                        additional_info: notesText === '-' ? '' : notesText
                    })
                });
            } catch (sheetErr) {
                console.error('Failed to submit to Google Sheets:', sheetErr);
            }
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
        const telPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : (phone.startsWith('+') ? phone : `+${cleanPhone}`);

        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'short'
        });

        const text = `
🚀 <b>*NEW QUOTE REQUEST*</b>
--------------------------
🕒 <b>Received</b>: ${timestamp}

👤 <b>Customer</b>: <b>${name}</b>
📞 <b>Phone</b>: <b>${phone}</b>
📧 <b>Email</b>: <b>${email || '-'}</b>

🛠️ <b>Service</b>: <b>${formatLabel(service)}</b>
📅 <b>Moving Date</b>: <b>${moving_date}</b>
📍 <b>Moving From</b>: <b>${moving_from}</b>
🏁 <b>Moving To</b>: <b>${moving_to}</b>
📝 <b>Notes</b>: <i>${notesText}</i>

--------------------------

📞 <b>Click to call customer</b>: <a href="tel:${telPhone}">${phone}</a>
📋 <b>Click to Copy Number</b>: <code>${phone}</code>

💬 <b>WhatsApp</b>: <a href="https://wa.me/${waPhone}">Chat on WhatsApp</a>

<i>Source: Ultra Pro Website</i>
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
                        parse_mode: 'HTML',
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


