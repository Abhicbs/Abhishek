console.log("Chat widget script loaded");

// Create and inject the chat widget HTML
function createChatWidget() {
    console.log("Creating chat widget");
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
        <div class="chat-container" id="chatContainer">
            <div class="chat-header">
                <span>Chat with Abhishek's AI</span>
                <button class="chat-close" onclick="toggleChat()">×</button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="message ai-message">
                    Hi! I'm Abhishek's AI assistant. How can I help you today?
                </div>
            </div>
            <div class="typing-indicator" id="typingIndicator">
                AI is thinking<div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Type your message...">
                    <button class="chat-send" id="sendButton">Send</button>
                </div>
            </div>
        </div>
        <button class="chat-button" id="toggleButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
    `;
    document.body.appendChild(chatWidget);
    
    // Add event listeners
    console.log("Adding event listeners");
    document.getElementById('chatInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('toggleButton').addEventListener('click', toggleChat);
}

// Toggle chat visibility
function toggleChat() {
    console.log("Toggle chat clicked");
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.classList.toggle('active');
}

// Simulate typing effect for AI messages
async function typeMessage(element, text) {
    const minDelay = 10;  // Minimum delay between characters
    const maxDelay = 30;  // Maximum delay between characters
    const punctuationDelay = 150;  // Delay after punctuation marks
    const punctuation = ['.', '!', '?', ',', ';', ':'];
    
    element.classList.add('typing');
    
    for (let i = 0; i < text.length; i++) {
        element.textContent = text.substring(0, i + 1);
        
        // Add natural-feeling delays
        if (punctuation.includes(text[i])) {
            await new Promise(resolve => setTimeout(resolve, punctuationDelay));
        } else {
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    element.classList.remove('typing');
}

// Add message to chat
async function addMessage(text, sender) {
    console.log("Adding message:", {text, sender});
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    if (sender === 'user') {
        messageDiv.textContent = text;
    } else {
        // For AI messages, add typing animation
        messageDiv.textContent = '';
        messagesContainer.appendChild(messageDiv);
        await typeMessage(messageDiv, text);
    }
    
    if (sender === 'user') {
        messagesContainer.appendChild(messageDiv);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message to backend
async function sendMessage() {
    console.log("Send message function called");
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        console.log("Sending message:", message);
        // Add user message
        addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'block';

        try {
            console.log("Making API call to /ask");
            // Send message to backend (same origin as portfolio site)
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

            console.log("API response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API response data:", data);
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            
            // Check if we have a valid response
            if (data.response) {
                await addMessage(data.response, 'ai');
            } else if (data.error) {
                await addMessage("I apologize, but I encountered an error: " + data.error, 'ai');
            } else {
                await addMessage("I apologize, but I received an invalid response. Please try again.", 'ai');
            }
        } catch (error) {
            console.error('Error in API call:', error);
            typingIndicator.style.display = 'none';
            await addMessage('I apologize, but I encountered a connection error. Please try again.', 'ai');
        }
    }
}

// Initialize chat widget when the page loads
console.log("Setting up DOMContentLoaded listener");
document.addEventListener('DOMContentLoaded', createChatWidget); 