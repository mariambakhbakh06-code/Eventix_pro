// test-openai.js
require('dotenv').config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  console.log("Testing OpenAI API...");
  console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
  console.log("API Key starts with:", process.env.OPENAI_API_KEY?.substring(0, 10));
  
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say 'Hello World'" }],
      max_tokens: 20
    });
    
    console.log("✅ OpenAI working!");
    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
    console.error("Full error:", error);
  }
}

testOpenAI();