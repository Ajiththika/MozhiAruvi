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

    try {
        // Prepare a robust, prompt-engineered input for stable Hub inference
        let prompt = `<s>[INST] ${SYSTEM_PROMPT}\n\n`;
        chatHistory.slice(-4).forEach(m => {
            prompt += `${m.role === 'assistant' ? '' : '[INST] '}${m.content}${m.role === 'assistant' ? '' : ' [/INST]'}\n`;
        });
        prompt += `[INST] ${userMessage} [/INST]`;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 512,
                        temperature: 0.7,
                        return_full_text: false,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            console.error(`AI Hub Error (${response.status}):`, errBody);
            return "MozhiAruvi is currently meditating on ancient texts. Please give her a moment to return to the river (Hub connectivity issue).";
        }

        const data = await response.json();
        
        // Extract from stable format (usually a list of generated texts)
        const output = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
        return output || "The linguistic river is currently quiet. Please try again soon.";

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}
