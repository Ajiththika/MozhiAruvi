// ── Mozhi Aruvi Official AI Logic ───────────────────────────────────────────
// Lightweight Hugging Face Inference Controller (V1 Chat Completions Port)
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

export async function getAiResponse(userMessage, chatHistory = []) {
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HUGGINGFACE_API_KEY) {
        throw new Error("HUGGINGFACE_API_KEY is not configured in environment.");
    }

    // Modern OpenAI-Compatible Messages Payload
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatHistory,
        { role: "user", content: userMessage }
    ];

    try {
        // Using the v1/chat/completions endpoint (Stable & Modern for Llama 3)
        const response = await fetch(
            "https://api-inference.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct",
                    messages,
                    max_tokens: 512,
                    temperature: 0.7,
                    stream: false,
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || `Linguistic flux failure: ${response.status}`);
        }

        const data = await response.json();
        
        // Correct extraction for the completions API
        return data.choices?.[0]?.message?.content || "The linguistic river is currently quiet. Please try again soon.";

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}
