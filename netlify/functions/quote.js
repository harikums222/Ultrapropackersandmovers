const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://harikums222.github.io',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

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
        const { name, phone, email, service, from, to, message } = body;

        if (!name || !phone || !service || !from || !to) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Telegram environment variables not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        const text = `
🚚 *New Quote Request*
👤 *Name*: ${name}
📞 *Phone*: ${phone}
📧 *Email*: ${email || 'Not provided'}
🛠️ *Service*: ${service}
📍 *From*: ${from}
🏁 *To*: ${to}
📝 *Note*: ${message || '-'}
Source: Ultra Pro Website
    `.trim();

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        const telegramResp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text,
                parse_mode: 'Markdown'
            })
        });

        if (telegramResp.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            const errorData = await telegramResp.json();
            console.error('Telegram API error:', errorData);
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Failed to send message to Telegram' })
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
