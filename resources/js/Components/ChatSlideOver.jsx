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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatSlideOver({ isOpen, onClose, context }) {
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

        // Snapshot current messages BEFORE adding the new user message,
        // so we send only prior exchanges as history (not the current question).
        const history = messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content }));

        setMessages((prev) => [...prev, { role: 'user', content: question }]);
        setIsLoading(true);

        try {
            const response = await axios.post('/chat/ask', {
                question,
                context,
                history,
            });
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
                                    <div className="flex h-full flex-col bg-white shadow-2xl">
                                        {/* Header */}
                                        <div className="bg-white border-b border-gray-100 px-6 py-6">
                                            <div className="flex items-center justify-between">
                                                <DialogTitle className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
                                                    AI Assistant
                                                </DialogTitle>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
                                                        <span className="sr-only">Close</span>
                                                        <X className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    {context === 'dashboard' ? 'Ask questions about your overall statistics.' :
                                                     context === 'invoices.index' ? 'Ask questions about your invoices.' :
                                                     context === 'suppliers.index' ? 'Ask questions about your suppliers.' :
                                                     context === 'customers.index' ? 'Ask questions about your customers.' :
                                                     'Ask questions about your financial data.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Messages area */}
                                        <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-[#fafafa]">
                                            {messages.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-700">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                                                        <div className="relative rounded-2xl bg-white shadow-sm border border-indigo-50 p-5">
                                                            <Sparkles className="h-10 w-10 text-indigo-600" />
                                                        </div>
                                                    </div>
                                                    <div className="max-w-xs space-y-4">
                                                        <p className="text-sm font-medium text-gray-600">Some example questions:</p>
                                                        <div className="flex flex-col gap-3">
                                                            {(context === 'invoices.index' ? [
                                                                "Show me all duplicate invoices",
                                                                "What is the total amount of processed invoices?",
                                                                "Find invoices with a VAT mismatch anomaly"
                                                            ] : context === 'suppliers.index' ? [
                                                                "Who is our top supplier by purchase volume?",
                                                                "List new suppliers added recently",
                                                                "Which supplier has the highest total VAT?"
                                                            ] : context === 'customers.index' ? [
                                                                "Who is our top customer by billing amount?",
                                                                "List all customers with their ICE numbers",
                                                                "Show me customers with their total invoice counts"
                                                            ] : [
                                                                "Give me a breakdown of spending by category",
                                                                "What is the total sum of all invoices?",
                                                                "Are there any invoices with date anomalies?"
                                                            ]).map((suggestion, i) => (
                                                                <button 
                                                                    key={i}
                                                                    onClick={() => setInput(suggestion)}
                                                                    className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-indigo-500/10 hover:scale-[1.02] transition-all text-gray-700 text-sm font-medium group"
                                                                >
                                                                    <span className="group-hover:text-indigo-600 transition-colors">"{suggestion}"</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-6">
                                                {messages.map((msg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                                                    >
                                                        <div
                                                            className={`rounded-2xl px-4 py-2.5 max-w-[88%] text-sm leading-relaxed ${
                                                                msg.role === 'user'
                                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 whitespace-pre-wrap'
                                                                    : msg.role === 'error'
                                                                    ? 'bg-red-50 text-red-700 border border-red-100 whitespace-pre-wrap'
                                                                    : 'bg-white text-gray-900 border border-gray-100 shadow-sm'
                                                            }`}
                                                        >
                                                            {msg.role === 'assistant' ? (
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                                                        em: ({ children }) => <em className="italic">{children}</em>,
                                                                        ul: ({ children }) => <ul className="mt-1 mb-2 space-y-0.5 list-disc list-inside text-gray-700">{children}</ul>,
                                                                        ol: ({ children }) => <ol className="mt-1 mb-2 space-y-0.5 list-decimal list-inside text-gray-700">{children}</ol>,
                                                                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                                                        table: ({ children }) => (
                                                                            <div className="overflow-x-auto my-2 rounded-lg border border-gray-100">
                                                                                <table className="min-w-full text-xs">{children}</table>
                                                                            </div>
                                                                        ),
                                                                        thead: ({ children }) => <thead className="bg-gray-50 border-b border-gray-100">{children}</thead>,
                                                                        tbody: ({ children }) => <tbody className="divide-y divide-gray-50">{children}</tbody>,
                                                                        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">{children}</th>,
                                                                        td: ({ children }) => <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{children}</td>,
                                                                        code: ({ children }) => <code className="px-1 py-0.5 rounded bg-gray-100 text-indigo-600 text-xs font-mono">{children}</code>,
                                                                        hr: () => <hr className="my-2 border-gray-100" />,
                                                                    }}
                                                                >
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            ) : (
                                                                msg.content
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {isLoading && (
                                                    <div className="flex justify-start">
                                                        <div className="rounded-2xl px-5 py-3 max-w-[85%] text-sm bg-white text-gray-500 border border-gray-100 shadow-sm flex items-center space-x-2">
                                                            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </div>

                                        {/* Input area */}
                                        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-5 sm:px-6 bg-white">
                                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                                <input
                                                    type="text"
                                                    name="question"
                                                    id="question"
                                                    autoComplete="off"
                                                    className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3 pl-4 pr-14 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all sm:text-sm"
                                                    placeholder="Ask your question..."
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                                <div className="absolute right-2">
                                                    <button
                                                        type="submit"
                                                        disabled={!input.trim() || isLoading}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                                                    >
                                                        <Send className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </form>
                                            <p className="mt-2 text-[10px] text-center text-gray-400 uppercase tracking-widest font-medium">
                                                Powered by BillMind AI
                                            </p>
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
