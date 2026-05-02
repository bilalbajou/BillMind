import { Fragment, useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { X, Send, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function ChatSlideOver({ isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const question = input.trim();
        setInput('');
        
        // Add user message
        const newUserMsg = { role: 'user', content: question };
        setMessages((prev) => [...prev, newUserMsg]);
        
        setIsLoading(true);

        try {
            const response = await axios.post('/chat/ask', { question });
            const aiMsg = { role: 'assistant', content: response.data.answer };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'An error occurred.';
            setMessages((prev) => [...prev, { role: 'error', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <TransitionChild
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col bg-white shadow-xl">
                                        {/* Header */}
                                        <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <DialogTitle className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                                    AI Assistant
                                                </DialogTitle>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-500">
                                                    Ask questions about your invoices, suppliers, and expenses.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Messages area */}
                                        <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-gray-50">
                                            {messages.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                                    <div className="rounded-full bg-indigo-50 p-4">
                                                        <Sparkles className="h-8 w-8 text-indigo-600" />
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-sm w-full">
                                                        <p className="mb-4">Here are some example questions:</p>
                                                        <div className="flex flex-col gap-2">
                                                            <button 
                                                                onClick={() => setInput("What are my unpaid invoices?")}
                                                                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition-all text-gray-700 text-sm"
                                                            >
                                                                "What are my unpaid invoices?"
                                                            </button>
                                                            <button 
                                                                onClick={() => setInput("How much did I spend this month?")}
                                                                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition-all text-gray-700 text-sm"
                                                            >
                                                                "How much did I spend this month?"
                                                            </button>
                                                            <button 
                                                                onClick={() => setInput("Who is my most expensive supplier?")}
                                                                className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition-all text-gray-700 text-sm"
                                                            >
                                                                "Who is my most expensive supplier?"
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {messages.map((msg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`rounded-lg px-4 py-2 max-w-[85%] text-sm ${
                                                                msg.role === 'user'
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : msg.role === 'error'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                                            }`}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {isLoading && (
                                                    <div className="flex justify-start">
                                                        <div className="rounded-lg px-4 py-2 max-w-[85%] text-sm bg-white text-gray-500 border border-gray-200 shadow-sm flex items-center space-x-2">
                                                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </div>

                                        {/* Input area */}
                                        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-4 sm:px-6 bg-white">
                                            <form onSubmit={handleSubmit} className="flex space-x-3">
                                                <div className="min-w-0 flex-1">
                                                    <label htmlFor="question" className="sr-only">
                                                        Your question
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="question"
                                                        id="question"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        placeholder="Ask your question..."
                                                        value={input}
                                                        onChange={(e) => setInput(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!input.trim() || isLoading}
                                                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send className="h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
