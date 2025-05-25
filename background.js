// background.js

async function modifyPromptWithAI(text, modificationType, apiKeyParam, modelNameParam) {
    try {
        const data = await chrome.storage.sync.get(["apiKey", "defaultModel"]);

        // Use apiKeyParam if provided, otherwise use stored apiKey
        const apiKey = apiKeyParam || data.apiKey;
        if (!apiKey) {
            console.error("Error: AI API Key not set.");
            return "Error: AI API Key not set. Please set it in the extension options or provide it to the function.";
        }

        // Use modelNameParam if provided, otherwise use stored defaultModel or fallback to 'gemini-pro'
        let modelIdentifier = modelNameParam || data.defaultModel || "gemini-pro";

        modelIdentifier = modelIdentifier.trim(); // Ensure no leading/trailing spaces

        // Ensure modelIdentifier does not start with "models/" as it's already in the URL structure
        if (modelIdentifier.startsWith("models/")) {
            modelIdentifier = modelIdentifier.substring("models/".length);
        }

        if (!modelIdentifier) {
            // This case should ideally not be reached if we have a fallback like 'gemini-pro'
            console.error("AI Model Name is missing or invalid after cleaning.");
            return "Error: AI Model Name is missing or invalid. Please check extension options.";
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelIdentifier}:generateContent?key=${apiKey}`;

        let userPromptContent;
        // Instruct the AI to act as a prompt engineer
        const promptEngineeringInstruction = "You are an expert prompt engineer. Your task is to refine the following user's request to make it a clear, effective, and high-quality prompt for a large language model.";

        switch (modificationType) {
            case "summarize":
                userPromptContent = `${promptEngineeringInstruction} The user wants to summarize the following text. Refine this into an excellent summarization prompt: "${text}"`;
                break;
            case "bulletPoints":
                userPromptContent = `${promptEngineeringInstruction} The user wants to convert the following text into bullet points. Refine this into an excellent prompt for bullet point conversion: "${text}"`;
                break;
            case "improve": // This was an existing option in popup, kept for compatibility
                userPromptContent = `${promptEngineeringInstruction} The user wants to improve the following text. Refine this into an excellent prompt for text improvement: "${text}"`;
                break;
            case "simplify":
                userPromptContent = `${promptEngineeringInstruction} The user wants to simplify the following text. Refine this into an excellent prompt for text simplification: "${text}"`;
                break;
            case "elaborate":
                userPromptContent = `${promptEngineeringInstruction} The user wants to elaborate on the following text. Refine this into an excellent prompt for text elaboration: "${text}"`;
                break;
            case "correctGrammar":
                userPromptContent = `${promptEngineeringInstruction} The user wants to correct the grammar of the following text. Refine this into an excellent prompt for grammar correction: "${text}"`;
                break;
            case "changeToneProfessional":
                userPromptContent = `${promptEngineeringInstruction} The user wants to change the tone of the following text to professional. Refine this into an excellent prompt for changing tone to professional: "${text}"`;
                break;
            case "changeToneCasual":
                userPromptContent = `${promptEngineeringInstruction} The user wants to change the tone of the following text to casual. Refine this into an excellent prompt for changing tone to casual: "${text}"`;
                break;
            case "translateToSpanish":
                userPromptContent = `${promptEngineeringInstruction} The user wants to translate the following text to Spanish. Refine this into an excellent prompt for translation to Spanish: "${text}"`;
                break;
            case "translateToFrench":
                userPromptContent = `${promptEngineeringInstruction} The user wants to translate the following text to French. Refine this into an excellent prompt for translation to French: "${text}"`;
                break;
            case "concise": // This was an existing option in popup, kept for compatibility
                userPromptContent = `${promptEngineeringInstruction} The user wants to make the following text more concise. Refine this into an excellent prompt for making text concise: "${text}"`;
                break;
            case "expand": // This was an existing option in popup, kept for compatibility
                userPromptContent = `${promptEngineeringInstruction} The user wants to expand on the following text. Refine this into an excellent prompt for expanding text: "${text}"`;
                break;
            default: // Handles "formal" and other previous "custom" cases from old popup
                userPromptContent = `${promptEngineeringInstruction} The user's original request is: "${text}". The desired modification style is '${modificationType}'. Refine this into a clear and effective prompt.`;
        }

        const requestBody = {
            contents: [{
                    parts: [{
                        text: userPromptContent
                    }]
                }]
                // You might want to add generationConfig here, e.g.:
                // "generationConfig": {
                //   "temperature": 0.7,
                //   "maxOutputTokens": 150
                // }
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("Gemini API Error:", response.status, errorData);
            return `Error from Gemini API: ${errorData.error ? errorData.error.message : (errorData.message || response.statusText)}`;
        }

        const responseData = await response.json();

        if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0] && responseData.candidates[0].content.parts[0].text) {
            return responseData.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Unexpected Gemini API response format:", responseData);
            return "Error: Could not parse Gemini API response.";
        }

    } catch (error) {
        console.error("Error in modifyPromptWithAI:", error);
        return `Error: ${error.message}`;
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "modifyPromptAI",
        title: "Modify with AI",
        contexts: ["selection", "editable"]
    });
    console.log("AI Prompt Modifier context menu created.");
});

chrome.contextMenus.onClicked.addListener(async(info, tab) => {
    if (info.menuItemId === "modifyPromptAI") {
        if (tab && tab.id !== undefined) {
            try {
                // No response is expected or used from this sendMessage call here
                await chrome.tabs.sendMessage(tab.id, {
                    action: "getAndModifyText",
                    selectedText: info.selectionText
                    // No modificationType is sent from context menu, popup.js handles that.
                    // If context menu needs to specify a default type, it would be added here.
                });
            } catch (error) {
                console.error("Error sending message to content script:", error);
                if (error.message.includes("Receiving end does not exist")) {
                    console.warn("Content script not available in the target tab or page.");
                }
            }
        } else {
            console.error("Error: Tab ID is undefined. Cannot send message to content script.");
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "modifyTextWithAI") {
        const { textToModify, modificationType } = request; // apiKey and modelName are not passed from popup
        modifyPromptWithAI(textToModify, modificationType) // API key and model are now read from storage within modifyPromptWithAI
            .then(modifiedText => {
                sendResponse({ modifiedText: modifiedText });
            })
            .catch(error => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                sendResponse({ error: errorMessage });
            });
        return true; // Indicate asynchronous response
    }
    return false; // For any other actions
});
