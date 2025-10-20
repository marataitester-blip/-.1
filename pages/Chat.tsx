
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { GoogleGenAI, Chat } from "@google/genai";
import LoadingSpinner from '../components/LoadingSpinner';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatPage: React.FC = () => {
    const { t, language } = useTranslations();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const chat = useMemo(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            return ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are the Master of the Astral Hero Tarot. Your name is the Master. You are wise, insightful, and supportive. Answer the user's questions about Tarot, their life path, or their concerns with compassion and clarity. Keep your answers concise and thoughtful. Your responses must be in ${language === 'ru' ? 'Russian' : 'English'}.`,
                },
            });
        } catch (e) {
            console.error(e);
            setError('Failed to initialize chat service.');
            return null;
        }
    }, [language]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const response = await chat.sendMessage({ message: input });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            console.error('Error sending message:', e);
            setError(t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-[75vh]">
            <div className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('chatTitle')}</h1>
            </div>

            <div ref={chatContainerRef} className="flex-grow p-4 bg-purple-900/30 rounded-lg border border-purple-700 overflow-y-auto mb-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <span className="w-8 h-8 rounded-full bg-yellow-400 text-purple-900 flex items-center justify-center font-bold text-sm flex-shrink-0">M</span>}
                            <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-yellow-400 text-purple-900' : 'bg-purple-800 text-gray-200'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                            <span className="w-8 h-8 rounded-full bg-yellow-400 text-purple-900 flex items-center justify-center font-bold text-sm flex-shrink-0">M</span>
                            <div className="max-w-md p-3 rounded-xl bg-purple-800 text-gray-200">
                                <LoadingSpinner size="small" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
             
             <div className="text-center text-xs text-gray-400 mb-4 px-4">
                {t('chatDisclaimer')}
            </div>

            {error && <p className="text-red-400 text-center mb-2">{error}</p>}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('chatPlaceholder')}
                    className="flex-grow px-4 py-2 bg-purple-800/50 border border-purple-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-yellow-400 text-purple-900 font-bold py-2 px-6 rounded-full hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('chatSend')}
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
