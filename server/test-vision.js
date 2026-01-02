import axios from 'axios';

const API_KEY = "28be2b46-b78f-494a-b98c-8d5e95ad8bd5";
const ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL = "doubao-seed-1-6-thinking-250715";

async function testVision() {
    try {
        console.log("Testing Vision Capabilities...");
        // Public test image
        const imageUrl = "https://ark-project.tos-cn-beijing.ivolces.com/images/view.jpeg";

        const response = await axios.post(
            ENDPOINT,
            {
                model: MODEL,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "这张图里有什么？" },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl
                                }
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                }
            }
        );

        console.log("Vision Test Success!");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Vision Test Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testVision();
