// ── Mozhi Aruvi Production AI Controller ─────────────────────────────────────
// Resilient Hugging Face Inference Suite with Retry Logic & Circuit Breaking
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are MozhiAruvi, the embodiment of Tamil linguistic heritage and the official AI ambassador for the MozhiAruvi platform. 
Our vision is "Mastering the Tamil language at scale," bridging the gap between ancient heritage and modern excellence.

KEY PLATFORM INFORMATION:
- LINGUISTIC SUITE: We offer interactive lessons ranging from basic grammar (Ezhuthu, Sol) to advanced literary analysis of Sangam Tamil.
- TUTOR ECOSYSTEM: Users can book 1-on-1 sessions with expert linguistic guides.
- CULTURAL HUB: We host events for cultural celebrations like Pongal, Tamil New Year, and classical literature festivals.
- EDITORIAL WORKSPACE: A space for students and masters to write blogs, stories, and research papers in Tamil.
- SUBSCRIPTION TIERS:
  * Explorer (Free): Basic lessons and community blogs.
  * Scholar (Pro - $19/mo): Full curriculum access and 2 tutor credits.
  * Master (Premium - $49/mo): Unlimited access, exclusive masterclasses, and priority support.

TONE & STYLE:
- Professional, welcoming, and deeply knowledgeable about Tamil culture.
- Use a bit of poetic flair (Waterfall/Aruvi metaphors) when appropriate.
- If unsure, direct them to mozhiaruvi5@gmail.com.
- ALWAYS identify as MozhiAruvi. NEVER mention Llama, Meta, or Hugging Face.
`;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export async function getAiResponse(userMessage, chatHistory = [], retryCount = 0) {
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HUGGINGFACE_API_KEY) {
        throw new Error("HUGGINGFACE_API_KEY is not configured in environment.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const payload = {
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...chatHistory.slice(-4),
                { role: "user", content: userMessage }
            ],
            max_tokens: 512,
            temperature: 0.7,
            stream: false
        };

        const response = await fetch(
            "https://api-inference.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "true"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (response.status === 503 || response.status === 429) {
            // Model loading or Rate limited
            if (retryCount < MAX_RETRIES) {
                console.warn(`[AI] Service unavailable (Status ${response.status}). Retrying ${retryCount + 1}/${MAX_RETRIES}...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
                return getAiResponse(userMessage, chatHistory, retryCount + 1);
            }
        }

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            console.error(`AI Hub Error (${response.status}):`, errBody);
            return "MozhiAruvi is currently meditating on ancient texts. Please give me a moment to return to the river (Service Interruption).";
        }

        const data = await response.json();
        const output = data.choices && data.choices[0]?.message?.content;
        
        return output || "The linguistic river is currently quiet. Please try again soon.";

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error("[AI] Request timed out.");
            return "The linguistic flow is taking longer than usual to reach you. Please try again in a moment.";
        }
        
        console.error("AI Service Error:", error);
        if (retryCount < MAX_RETRIES) {
            return getAiResponse(userMessage, chatHistory, retryCount + 1);
        }
        
        return "MozhiAruvi is currently experiencing a connection drought. Please check back soon.";
    }
}
