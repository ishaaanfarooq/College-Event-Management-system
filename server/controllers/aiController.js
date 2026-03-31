const chatWithBot = async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
    }

    try {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama3.2",
                messages: [
                    {
                        role: "system",
                        content: "You are the CEMS Assistant, a helpful and classy AI for the College Event Management System. Your goal is to help users manage, discover, and apply to college events. Be professional, friendly, and concise. Your design theme is 'Wheatish Classy' (Gold, Wheat, Ivory). Always stay in character as a college system assistant."
                    },
                    ...messages
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with local AI server");
        }

        const data = await response.json();
        res.json({ message: data.message.content });
    } catch (error) {
        console.error("Ollama Error:", error);
        res.status(500).json({ 
            message: "AI service is currently offline. Please ensure Ollama is running locally with llama3.2.",
            error: error.message 
        });
    }
};

module.exports = {
    chatWithBot,
};
