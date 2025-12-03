import { useState, useEffect, useRef } from "react";
import { signOut } from "aws-amplify/auth";
import { Link } from "react-router-dom";
import { useAuth } from "../components/Access/AuthContext";
import { apiFetch } from "../utils/api";
import "../assets/css/pages/chat.css";

export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [renameError, setRenameError] = useState(null);

    const { user, setUser } = useAuth();
    const chatBoxRef = useRef(null);

    const scrollToBottom = () => {
        chatBoxRef.current?.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth",
        });
    };
    useEffect(scrollToBottom, [messages]);

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await apiFetch("/api/conversations");
            const data = await res.json();
            setConversations(data);
        } catch (err) {
            console.error("Error cargando conversaciones:", err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const selectConversation = async (conv) => {
        try {
            setSelectedConversation(conv);
            const res = await apiFetch(`/api/messages/${conv.id}`);
            const data = await res.json();

            const mappedMessages = data.map((m) => ({
                content: m.content,
                type: m.type,
                timestamp: m.timestamp,
            }));

            setMessages(mappedMessages);
        } catch (err) {
            console.error("Error cargando mensajes:", err);
        }
    };

    const createConversation = async () => {
        try {
            const response = await apiFetch("/api/conversations", {
                method: "POST",
                body: JSON.stringify({}),
            });

            const newConversation = await response.json();
            setConversations([...conversations, newConversation]);
            setSelectedConversation(newConversation);
        } catch (error) {
            if (error.message.includes("Has alcanzado")) {
                setShowLimitModal(true);
                return;
            }
            console.error("Error creando conversación:", error);
        }
    };

    const sendMessage = async (text) => {
        if (!selectedConversation?.id) return;

        const userMsg = {
            content: text,
            type: "USER",
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        try {
            const response = await apiFetch(
                `/api/messages/${selectedConversation.id}`,
                {
                    method: "POST",
                    body: JSON.stringify({ prompt: text }),
                }
            );

            const botMsg = await response.json();
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Error enviando mensaje:", error);
        }
    };

    const deleteConversation = async (id) => {
        try {
            const res = await apiFetch(`/api/conversations/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setConversations(conversations.filter((c) => c.id !== id));
                if (selectedConversation?.id === id) {
                    setSelectedConversation(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error("Error eliminando conversación:", err);
        }
    };

    const renameConversation = async (id) => {
        const newTitleRaw = prompt("Nuevo nombre de la conversación:");
        const newTitle = newTitleRaw?.trim();
        if (!newTitle) return;

        const prevConversations = [...conversations];
        const prevSelected = { ...selectedConversation };

        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === id
                    ? { ...conv, title: newTitle, updated: true }
                    : conv
            )
        );
        if (selectedConversation?.id === id) {
            setSelectedConversation((prev) => ({ ...prev, title: newTitle }));
        }

        try {
            const response = await apiFetch(`/api/conversations/${id}`, {
                method: "PUT",
                body: JSON.stringify({ title: newTitle }),
            });

            const data = await response.json();
            const updatedConversation = data || { id, title: newTitle };

            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === id
                        ? { ...conv, ...updatedConversation, updated: true }
                        : conv
                )
            );
            if (selectedConversation?.id === id) {
                setSelectedConversation((prev) => ({
                    ...prev,
                    ...updatedConversation,
                }));
            }

            setTimeout(() => {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === id ? { ...conv, updated: false } : conv
                    )
                );
            }, 1000);
        } catch (err) {
            let errorMsg = "Ya existe una conversación con ese título.";

            if (err instanceof Response) {
                try {
                    const errorData = await err.json();
                    errorMsg = errorData.message || errorMsg;
                } catch {
                    errorMsg = await err.text();
                }
            } else if (err?.message) {
                try {
                    const parsed = JSON.parse(err.message);
                    errorMsg = parsed.message || err.message;
                } catch {
                    errorMsg = err.message;
                }
            }

            setRenameError(errorMsg);
            setConversations(prevConversations);
            setSelectedConversation(prevSelected);
        }
    };

    return (
        <div className="chat-layout">
            {/* Sidebar */}
            <aside className="chat-sidebar">
                {/* Sección superior: logo y nueva conversación */}
                <div className="sidebar-header-section">
                    <Link to="/" className="sidebar-logo">
                        <span className="logo-text">Talky</span>
                    </Link>
                    <button className="btn-new" onClick={createConversation}>
                        <i className="fa-solid fa-plus"></i>
                        <span>Nueva</span>
                    </button>
                </div>

                {/* Lista de conversaciones */}
                <ul className="conversation-list flex-1 overflow-y-auto mt-4">
                    {conversations.map((conv) => (
                        <li
                            key={conv.id}
                            className={`conversation-item ${
                                selectedConversation?.id === conv.id
                                    ? "active"
                                    : ""
                            }`}>
                            <div 
                                className={`conversation-content ${
                                    conv.updated ? "updated" : ""
                                }`}
                                onClick={() => selectConversation(conv)}>
                                <div className="conversation-icon">
                                    <i className="fa-solid fa-message"></i>
                                </div>
                                <span className="conversation-title">
                                    {conv.title}
                                </span>
                            </div>

                            <div className="conversation-actions">
                                <button
                                    className="conversation-action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        renameConversation(conv.id);
                                    }}
                                    title="Renombrar">
                                    <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                    className="conversation-action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                    }}
                                    title="Eliminar">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Área principal de chat */}
            <main className="chat-main">
                <header className="chat-header">
                    <div className="chat-header-content">
                        {selectedConversation && (
                            <div className="chat-header-icon">
                                <i className="fa-solid fa-message"></i>
                            </div>
                        )}
                        <h2>
                            {selectedConversation?.title ||
                                "Selecciona una conversación"}
                        </h2>
                    </div>
                    <div className="chat-header-nav">
                        <Link to="/verbs" className="header-nav-item" title="Verbos">
                            <i className="fa-solid fa-book"></i>
                            <span>Verbos</span>
                        </Link>
                        <Link to="/glossary" className="header-nav-item" title="Glosario">
                            <i className="fa-solid fa-language"></i>
                            <span>Glosario</span>
                        </Link>
                        {user && (
                            <Link to="/profile" className="header-nav-item header-nav-profile" title="Perfil">
                                <i className="fa-solid fa-user"></i>
                                <span>{user.name}</span>
                            </Link>
                        )}
                        <button
                            className="header-nav-item header-nav-logout"
                            onClick={handleLogout}
                            title="Cerrar sesión">
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span>Salir</span>
                        </button>
                    </div>
                </header>

                <div className="chat-box" ref={chatBoxRef}>
                    {messages.length === 0 && selectedConversation ? (
                        <div className="empty-chat-state">
                            <div className="empty-chat-icon">
                                <i className="fa-solid fa-comments"></i>
                            </div>
                            <h3>Inicia una conversación</h3>
                            <p>Escribe un mensaje para comenzar a chatear con Talky</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-chat-state">
                            <div className="empty-chat-icon">
                                <i className="fa-solid fa-message"></i>
                            </div>
                            <h3>Selecciona una conversación</h3>
                            <p>Elige una conversación existente o crea una nueva para comenzar</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`message-wrapper ${
                                    msg.type === "USER"
                                        ? "message-user-wrapper"
                                        : "bot-message-wrapper"
                                }`}>
                                <div className="message-avatar">
                                    {msg.type === "USER" ? (
                                        <i className="fa-solid fa-user"></i>
                                    ) : (
                                        <i className="fa-solid fa-robot"></i>
                                    )}
                                </div>
                                <div
                                    className={`message ${
                                        msg.type === "USER"
                                            ? "message-user"
                                            : "bot-message"
                                    }`}>
                                    <div className="message-content">
                                        {msg.content}
                                    </div>
                                    {msg.timestamp && (
                                        <div className="message-timestamp">
                                            {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedConversation && (
                    <form
                        className="chat-input-wrapper"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (input.trim()) sendMessage(input.trim());
                        }}>
                        <div className="chat-input-container">
                            <textarea
                                className="chat-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                rows="1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (input.trim()) sendMessage(input.trim());
                                    }
                                }}
                            />
                            <button 
                                className="btn-send" 
                                type="submit"
                                disabled={!input.trim()}
                                title="Enviar mensaje">
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* Modal de límite */}
            {showLimitModal && (
                <div className="modal-overlay flex items-center justify-center">
                    <div className="modal">
                        <h3>Límite alcanzado</h3>
                        <p>Solo puedes tener 4 conversaciones.</p>
                        <p className="subtext">
                            Elimina una antes de crear otra.
                        </p>
                        <button
                            className="btn-close"
                            onClick={() => setShowLimitModal(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {renameError && (
                <div className="modal-overlay flex items-center justify-center">
                    <div className="modal">
                        <h3>Error al renombrar</h3>
                        <p>{renameError}</p>
                        <button
                            className="btn-close"
                            onClick={() => setRenameError(null)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
