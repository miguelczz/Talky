import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "../assets/css/pages/verbs.css";

/**
 * Componente Verbs
 * - carga lista local de verbos (JSON)
 * - permite guardar un verbo en el glosario del usuario mediante el backend
 * - lista las palabras ya guardadas por el usuario para deshabilitar el botón
 */
export default function Verbs() {
    const [verbs, setVerbs] = useState([]);
    const [savedWords, setSavedWords] = useState([]);
    const [type, setType] = useState("regular");

    useEffect(() => {
        loadVerbs(type);
    }, [type]);

    // Al montar, carga las palabras del glosario asociadas al usuario
    useEffect(() => {
        loadSavedWords();
    }, []);

    /**
     * Carga el JSON local de verbos (regular/irregular).
     */
    const loadVerbs = async (verbType) => {
        try {
            const response = await fetch(`/data/${verbType}_verbs.json`);
            const data = await response.json();
            setVerbs(data);
        } catch (error) {
            console.error("Error al cargar los verbos:", error);
        }
    };

    /**
     * Solicita al backend las palabras guardadas del usuario (GET /api/glossary).
     * Se espera que el endpoint devuelva un array de objetos con al menos la propiedad `word`.
     */
    const loadSavedWords = async () => {
        try {
            const res = await apiFetch("/api/glossary", { method: "GET" });
            const data = await res.json();
            setSavedWords(data.map((w) => w.word));
        } catch (err) {
            console.error("Error al cargar palabras guardadas:", err);
        }
    };

    /**
     * handleSave: guarda la palabra en el glosario del usuario mediante POST /api/glossary
     * - request body: { word, meaning }
     * - envía Authorization: Bearer <token>
     */
    const handleSave = async (verb) => {
        try {
            const res = await apiFetch("/api/glossary", {
                method: "POST",
                body: JSON.stringify({
                    word: verb.infinitive,
                    meaning: verb.translation,
                }),
            });
            const saved = await res.json();
            setSavedWords((prev) => [...new Set([...prev, saved.word])]);
        } catch (error) {
            console.error("Error al guardar palabra:", error);
        }
    };

    return (
        <div className="container mt-6 py-4 verbs-container">
            <div className="flex justify-between items-center mb-6">
                <h2 className="mb-0 text-white font-semibold">
                    Tabla de Verbos{" "}
                    <span id="verb-type" className="text-white text-base ms-2">
                        ({type === "regular" ? "Regulares" : "Irregulares"})
                    </span>
                </h2>
                <div>
                    <button
                        className={`toggle-btn ${
                            type === "regular" ? "active" : ""
                        }`}
                        onClick={() => setType("regular")}>
                        Regulares
                    </button>
                    <button
                        className={`toggle-btn ${
                            type === "irregular" ? "active" : ""
                        }`}
                        onClick={() => setType("irregular")}>
                        Irregulares
                    </button>
                </div>
            </div>

            <table className="verbs-table text-center">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Infinitivo</th>
                        <th>Pasado</th>
                        <th>Pasado Participio</th>
                        <th>Traducción</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {verbs.map((verb, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{verb.infinitive}</td>
                            <td>{verb.past}</td>
                            <td>{verb.participle}</td>
                            <td>{verb.translation}</td>
                            <td>
                                {savedWords.includes(verb.infinitive) ? (
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        disabled>
                                        Guardado
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleSave(verb)}>
                                        Guardar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
