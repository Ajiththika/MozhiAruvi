// ── Mozhi Aruvi AI Service (Resilient Gemini Edition) ───────────────────────────
// Direct fetch architecture for stability and multi-model fallback.
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are MozhiAruvi, the official expert Tamil tutor for the MozhiAruvi platform. 
Identify as MozhiAruvi. Be concise, helpful, and speak primarily in English with Tamil words included.
Help students learn Tamil language, culture, and literature.`;

export async function getAiResponse(userMessage, chatHistory = []) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return "MozhiAruvi is waiting for her key to the linguistic library. (API Key Missing)";

    try {
        // 1. Initialize contents with a sturdy User-Model start pattern
        const contents = [
            { role: "user", parts: [{ text: "System Instructions: " + SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "Vannakkam! I am MozhiAruvi. I am ready to guide you through the beautiful Tamil language." }] }
        ];

        // 2. Process history ensuring strict role alternation (User -> Model -> User)
        chatHistory.slice(-10).forEach(m => {
            const role = m.role === 'assistant' ? 'model' : 'user';
            const lastRole = contents[contents.length - 1].role;

            if (role !== lastRole) {
                contents.push({
                    role,
                    parts: [{ text: m.content || " " }]
                });
            }
        });

        // 3. Final safety check: ensuring the last message before the new one is 'model'
        if (contents[contents.length - 1].role === 'user') {
            contents.push({ role: 'model', parts: [{ text: "I understand. Please continue." }] });
        }

        // 4. Append the current message
        contents.push({ role: "user", parts: [{ text: userMessage }] });

        // 5. Try calling the API with fallback logic
        const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let lastError = null;

        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 800,
                        }
                    })
                });

                const data = await response.json();

                if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    return data.candidates[0].content.parts[0].text.trim();
                }

                if (data.error) {
                    console.warn(`[Gemini Try ${model}]:`, data.error.message);
                    lastError = data.error;
                    // If it's a quota error, don't just try other models necessarily, but for 404 we should.
                    if (data.error.code === 404) continue; 
                }
            } catch (err) {
                console.error(`[Gemini Connection ${model}]:`, err.message);
                lastError = err;
            }
        }

        if (lastError) {
            return `The linguistic river is a bit turbulent: ${lastError.message?.substring(0, 60)}... (Code: ${lastError.code || 'UNKNOWN'})`;
        }

        return "MozhiAruvi is currently reflecting on your question. Please try asking in a different way.";

    } catch (error) {
        console.error("❌ [CRITICAL AI SERVICE FAULT]:", error);
        return "A deep ripple in the river has occurred. Please try again in a few moments.";
    }
}
