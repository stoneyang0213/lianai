import axios from 'axios';

const API_KEY = "28be2b46-b78f-494a-b98c-8d5e95ad8bd5";
const ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL = "doubao-seed-1-6-thinking-250715";

async function testApi() {
    try {
        console.log("Testing API connection...");
        const response = await axios.post(
            ENDPOINT,
            {
                model: MODEL,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "你好，请做一个自我介绍。" }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                timeout: 30000
            }
        );

        console.log("API Success!");
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("API Error details:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testApi();
