
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.HUGGINGFACE_API_KEY;

async function testAI() {
    console.log("Testing Mistral stable format...");
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: "<s>[INST] What is the capital of Paris? [/INST]",
                }),
            }
        );
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e.message);
        process.exit(1);
    }
}

testAI();
