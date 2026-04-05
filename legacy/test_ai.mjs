
import dotenv from 'dotenv';
dotenv.config({ path: 'f:\\Mozhi Aruvi\\Backend\\.env' });

const apiKey = process.env.HUGGINGFACE_API_KEY;

async function testAI() {
    console.log("Testing AI with Key...");
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct",
                    messages: [{ role: "user", content: "Hello" }],
                    max_tokens: 10,
                }),
            }
        );
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

testAI();
