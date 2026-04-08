import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
    const key = "AIzaSyD6LtDylJgaqELBwaUiakZvMBVPHLqL1hw";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log(`[SDK TEST] Key: ${key.substring(0, 5)}...`);
    
    try {
        const result = await model.generateContent("Hello");
        console.log("[SDK SUCCESS]:", result.response.text());
    } catch (e) {
        console.error("[SDK FAILURE]:", e.message || e);
    }
}
test();
