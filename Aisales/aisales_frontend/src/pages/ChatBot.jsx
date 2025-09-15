import { useState, useEffect, useRef } from 'react';
import styles from './modules/ChatBot.module.css';
import { useAuth } from '../contexts/AuthContext';

const ChatBot = ({ orderId }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { token } = useAuth();

    const suggestionChips = [
        "Tell me about your products",
        "What are your prices?",
        "How can I place an order?",
        "Contact support"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initial greeting
        setMessages([{
            type: 'bot',
            content: 'Hello! I\'m Orbi, your AI Sales Assistant. How can I help you today?',
            timestamp: new Date().toLocaleTimeString()
        }]);
    }, []);

    const handleChipClick = (suggestion) => {
        setInputMessage(suggestion);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMessage = {
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await fetch(`http://localhost:8080/api/chat/${orderId}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    question: inputMessage
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Simulate typing delay for better UX
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: data.response || data.answer || data,
                    timestamp: new Date().toLocaleTimeString()
                }]);
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    };

    return (
        <div className={styles.chatbot}>
            <div className={styles.chatHeader}>
                <h3>Orbi AI Sales Assistant</h3>
                <div className={styles.statusIndicator}>
                    <div className={styles.statusDot}></div>
                    <span>Online</span>
                </div>
            </div>

            <div className={styles.chatMessages}>
                {messages.map((message, index) => (
                    <div key={index}
                        className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.botMessage
                            }`}>
                        {message.content}
                        <div className={styles.timestamp}>{message.timestamp}</div>
                    </div>
                ))}
                {isTyping && (
                    <div className={styles.typing}>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.suggestionChips}>
                {suggestionChips.map((chip, index) => (
                    <div
                        key={index}
                        className={styles.chip}
                        onClick={() => handleChipClick(chip)}
                    >
                        {chip}
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className={styles.chatInput}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatBot;