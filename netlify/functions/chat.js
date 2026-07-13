exports.handler = async function(event, context) {
    // Tarayıcı güvenlik (CORS) duvarını aşmak için ön kontrol
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Sistem: Sadece POST istekleri kabul edilir." })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const prompt = body.prompt;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Sistem Hatası: GEMINI_API_KEY bulunamadı." })
            };
        }

        // DİKKAT: Senin panele (AI Studio) özel model adı buraya entegre edildi.
// Google'ın doğrudan "daha yenisini kullan" uyarısı üzerine modeli gemini-2.5-flash olarak güncelliyoruz
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // Gemini API'den gelen olası hataları doğrudan yakala
        if (data.error) {
             return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: data.error.message })
            };
        }

        const replyText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ reply: replyText })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Kritik Çökme: " + error.message })
        };
    }
};