import dotenv from 'dotenv';
dotenv.config();

export const sendWhatsAppOTP = async (phone, otp, name = "User") => {
    // Format phone number to clean E.164 without formatting characters
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone;
    }

    console.log(`\n====================================`);
    console.log(`💬 [WHATSAPP SERVICE] Attempting OTP ${otp} to ${formattedPhone} (Name: ${name})`);
    console.log(`====================================\n`);

    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME;
    const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG;

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        console.warn("⚠️ WhatsApp API credentials missing in config. Returning true for development/testing.");
        // Log the OTP instead of failing if env vars are missing in development
        console.log(`Development OTP: ${otp}`);
        return true;
    }

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    // Helper to make fetch request to Meta Graph API with AbortController timeout
    const sendRequest = async (payload) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout limit

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            clearTimeout(timeoutId);
            return { ok: response.ok, status: response.status, data };
        } catch (err) {
            clearTimeout(timeoutId);
            return { ok: false, error: err };
        }
    };

    // Align parameter mapping with the user's template placeholders:
    // {{1}} = otp, {{2}} = brand name, {{3}} = validity, {{4}} = call helpline, {{5}} = contact support
    const bodyParams = [
        { "type": "text", "text": otp },
        { "type": "text", "text": "Zuvello" },
        { "type": "text", "text": "10 minutes" },
        { "type": "text", "text": "+918873405595" },
        { "type": "text", "text": "+918873405595" }
    ];

    const payloadAuth = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
            name: TEMPLATE_NAME,
            language: {
                code: TEMPLATE_LANG,
            },
            components: [
                {
                    "type": "body",
                    "parameters": bodyParams
                },
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [
                        {
                            "type": "text",
                            "text": otp,
                        },
                    ],
                },
            ],
        },
    };

    const attempt = await sendRequest(payloadAuth);
    if (attempt.ok) {
        console.log(`✅ WhatsApp OTP sent successfully:`, attempt.data);
        return true;
    }

    if (attempt.error?.name === "AbortError") {
        console.warn("⚠️ WhatsApp request timed out.");
    } else {
        console.error(`❌ WhatsApp sending failed:`, JSON.stringify(attempt.data || attempt.error));
    }

    return false;
};
