import { useState } from "react";
import { api, parseJsonOrEmpty } from "../api/client";

function AIhelper() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const res = await api("/api/ai-chat", {
                method: "POST",
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await parseJsonOrEmpty(res);
            console.log(data);
            if (!res.ok) {
                const msg =
                    data?.message ||
                    data?.error ||
                    (typeof data === "string" ? data : null) ||
                    "Request failed.";
                setError(msg);
                return;
            }

            const reply =
                typeof data?.reply === "string"
                    ? data.reply
                    : data?.error?.message ||
                    "No reply from assistant.";

            setMessages([
                ...newMessages,
                { role: "assistant", content: reply },
            ]);
        } catch (err) {
            console.error(err);
            setError(err.message || "Could not reach the server.");
            setMessages(messages);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="p-4 border rounded-lg">
            <h1 className="text-2xl font-semibold text-gray-800">AI Helper</h1>
            <p className="text-sm text-gray-500 mt-1">
                Ask your CRM assistant here.
            </p>

            {error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}

            <div className="mt-4 h-64 overflow-y-auto border p-2 rounded">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        <span className="block text-sm">
                            <b>{msg.role === "user" ? "You" : "AI"}:</b>{" "}
                            <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                        </span>
                    </div>
                ))}
                {loading && <p className="text-sm text-gray-400">Thinking...</p>}
            </div>

            <div className="mt-3 flex gap-2">
                <input
                    className="flex-1 border p-2 rounded"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your client..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 rounded"
                >
                    Send
                </button>
            </div>
        </section>
    );
}

export default AIhelper;