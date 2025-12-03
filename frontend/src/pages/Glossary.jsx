import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";

/**
 * Componente Glossary:
 * - Gestiona un glosario con CRUD, búsqueda, filtros y ordenamiento
 * - Permite edición inline, archivado y eliminación
 */

export default function Glossary() {
    // Estados principales
    const [words, setWords] = useState([]); // lista completa
    const [wordInput, setWordInput] = useState("");
    const [meaningInput, setMeaningInput] = useState("");

    // Controles de interfaz
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("active");
    const [sort, setSort] = useState("created_desc");

    // Edición inline
    const [editingId, setEditingId] = useState(null);
    const [editingValues, setEditingValues] = useState({ word: "", meaning: "" });

    // Estados para modales
    const [errorModal, setErrorModal] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const [addModal, setAddModal] = useState(false);

    // Control de dropdowns
    const [filterDropdown, setFilterDropdown] = useState(false);
    const [sortDropdown, setSortDropdown] = useState(false);

    // Carga inicial de palabras
    useEffect(() => {
        loadWords();
    }, []);

    // Cierre automático de dropdown de filtros
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-filter")) setFilterDropdown(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Cierre automático de dropdown de orden
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-sort")) setSortDropdown(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Carga de glosario desde API
    const loadWords = async () => {
        try {
            const res = await apiFetch("/api/glossary", { method: "GET" });
            const data = await res.json();
            setWords(data);
        } catch (err) {
            console.error("Error al cargar glosario:", err);
        }
    };

    // Agregar palabra nueva
    const handleAddWord = async () => {
        if (!wordInput.trim() || !meaningInput.trim()) {
            setErrorModal("Debes ingresar palabra y significado.");
            return false;
        }
        try {
            const res = await apiFetch("/api/glossary", {
                method: "POST",
                body: JSON.stringify({
                    word: wordInput.trim(),
                    meaning: meaningInput.trim(),
                }),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                throw new Error(errBody?.message || "Error agregando palabra");
            }

            const saved = await res.json();
            setWords((p) => [...p, saved]);
            setWordInput("");
            setMeaningInput("");
            return true;
        } catch (err) {
            let msg = err.message.includes("ya existe")
                ? "Ya tienes esta palabra en tu glosario."
                : err.message;
            setErrorModal(msg);
            return false;
        }
    };

    // Guardar cambios al editar
    const handleSaveEdit = async (id) => {
        try {
            const body = {
                word: editingValues.word.trim(),
                meaning: editingValues.meaning,
            };
            const res = await apiFetch(`/api/glossary/${id}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                throw new Error(errBody?.message || "Error actualizando palabra");
            }

            const updated = await res.json();
            setWords((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x))
            );
            handleCancelEdit();
        } catch (err) {
            let msg = err.message.includes("ya existe")
                ? "Ya tienes esta palabra en tu glosario."
                : err.message;
            setErrorModal(msg);
            return false;
        }
    };

    // Archivar o restaurar palabra
    const handleArchiveToggle = async (w, toArchive) => {
        try {
            const res = await apiFetch(`/api/glossary/${w.id}/archive`, {
                method: "PATCH",
                body: JSON.stringify({ archived: toArchive }),
            });
            if (!res.ok) throw res;
            const updated = await res.json();
            setWords((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x))
            );
        } catch (err) {
            console.error("Error archivando/desarchivando:", err);
            alert("No se pudo actualizar la palabra.");
        }
    };

    // Iniciar edición inline
    const handleStartEdit = (w) => {
        setEditingId(w.id);
        setEditingValues({ word: w.word, meaning: w.meaning });
    };

    // Cancelar edición inline
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingValues({ word: "", meaning: "" });
    };

    // Eliminar palabra con confirmación
    const handleDelete = (id) => {
        setConfirmModal({
            message: "¿Eliminar esta palabra de forma permanente?",
            onConfirm: async () => {
                try {
                    const res = await apiFetch(`/api/glossary/${id}`, {
                        method: "DELETE",
                    });
                    if (!res.ok && res.status !== 204) throw res;
                    setWords((prev) => prev.filter((w) => w.id !== id));
                } catch (err) {
                    setErrorModal("No se pudo eliminar la palabra", err);
                } finally {
                    setConfirmModal(null);
                }
            },
        });
    };

    // Lista filtrada y ordenada
    const displayed = useMemo(() => {
        let list = [...words];
        if (filter === "active") list = list.filter((w) => !w.archived);
        else if (filter === "archived") list = list.filter((w) => w.archived);

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (w) =>
                    w.word?.toLowerCase().includes(q) ||
                    w.meaning?.toLowerCase().includes(q)
            );
        }

        switch (sort) {
            case "created_asc":
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "alpha_asc":
                list.sort((a, b) => a.word.localeCompare(b.word, undefined, { sensitivity: "base" }));
                break;
            case "alpha_desc":
                list.sort((a, b) => b.word.localeCompare(a.word, undefined, { sensitivity: "base" }));
                break;
            default:
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
    }, [words, filter, search, sort]);

    return (
        <div className="container mt-10 mb-10 glossary-container px-4">
            {/* Encabezado y herramientas */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <h1 className="text-2xl self-end">Glosario</h1>

                {/* Barra de herramientas */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Campo de búsqueda */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-3 pr-9 py-2 rounded-md bg-gray-800 text-white min-w-[200px]"
                        />
                        <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>

                    {/* Filtro por estado */}
                    <div className="relative dropdown-filter">
                        <button
                            type="button"
                            className="px-3 py-2 rounded-md bg-gray-800 text-white flex items-center gap-2"
                            onClick={() => setFilterDropdown((prev) => !prev)}>
                            <i className="fa-solid fa-filter"></i>
                            {filter === "all"
                                ? "Todas"
                                : filter === "active"
                                ? "Activas"
                                : "Archivadas"}
                            <i className="fa-solid fa-chevron-down text-xs"></i>
                        </button>

                        {filterDropdown && (
                            <div className="absolute right-0 mt-2 w-40 rounded-md bg-gray-800 shadow-lg z-10 overflow-hidden">
                                {["all", "active", "archived"].map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setFilter(key);
                                            setFilterDropdown(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                            filter === key ? "bg-gray-700" : "hover:bg-gray-700"
                                        }`}>
                                        {key === "all"
                                            ? "Todas"
                                            : key === "active"
                                            ? "Activas"
                                            : "Archivadas"}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Orden de resultados */}
                    <div className="relative dropdown-sort">
                        <button
                            type="button"
                            className="px-3 py-2 rounded-md bg-gray-800 text-white flex items-center gap-2"
                            onClick={() => setSortDropdown((prev) => !prev)}>
                            <i className="fa-solid fa-arrow-down-wide-short"></i>
                            {sort === "created_desc"
                                ? "Recientes"
                                : sort === "created_asc"
                                ? "Más antiguas"
                                : sort === "alpha_asc"
                                ? "A → Z"
                                : "Z → A"}
                            <i className="fa-solid fa-chevron-down text-xs"></i>
                        </button>

                        {sortDropdown && (
                            <div className="absolute right-0 mt-2 w-40 rounded-md bg-gray-800 shadow-lg z-10 overflow-hidden">
                                {[
                                    { key: "created_desc", label: "Recientes" },
                                    { key: "created_asc", label: "Más antiguas" },
                                    { key: "alpha_asc", label: "A → Z" },
                                    { key: "alpha_desc", label: "Z → A" },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSort(key);
                                            setSortDropdown(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                            sort === key ? "bg-gray-700" : "hover:bg-gray-700"
                                        }`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botón para agregar nueva palabra */}
                    <button
                        onClick={() => setAddModal(true)}
                        className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 flex items-center gap-2">
                        <i className="fa-solid fa-plus"></i> Agregar
                    </button>
                </div>
            </div>

            <hr className="my-6 border-t border-gray-700" />

            {/* Lista principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                {displayed.length > 0 ? (
                    displayed.map((w) => (
                        <div key={w.id} className="glossary-card">
                            {/* Contenido */}
                            <div className="card-body">
                                {editingId === w.id ? (
                                    <>
                                        <input
                                            value={editingValues.word}
                                            onChange={(e) =>
                                                setEditingValues((s) => ({
                                                    ...s,
                                                    word: e.target.value,
                                                }))
                                            }
                                            className="w-full mb-2 px-3 py-2 rounded-md bg-gray-800 text-white"
                                        />
                                        <textarea
                                            value={editingValues.meaning}
                                            onChange={(e) =>
                                                setEditingValues((s) => ({
                                                    ...s,
                                                    meaning: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white"
                                            rows={2}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h5 className="text-lg font-semibold text-white mb-1">
                                            {w.word}
                                        </h5>
                                        <p className="text-sm text-gray-300 mb-3">{w.meaning}</p>
                                    </>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="card-footer mt-3">
                                <div className="text-xs text-gray-400">
                                    {w.archived ? "Archivada" : "Activa"} ·{" "}
                                    {new Date(w.createdAt).toLocaleDateString([], {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    {editingId === w.id ? (
                                        <>
                                            <button
                                                onClick={() => handleSaveEdit(w.id)}
                                                className="btn-archive"
                                                title="Guardar">
                                                <i className="fa-solid fa-check"></i>
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="btn-archive"
                                                title="Cancelar">
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleStartEdit(w)}
                                                className="btn-archive"
                                                title="Editar">
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleArchiveToggle(w, !w.archived)
                                                }
                                                className="btn-archive"
                                                title={w.archived ? "Restaurar" : "Archivar"}>
                                                <i
                                                    className={
                                                        w.archived
                                                            ? "fa-solid fa-box-open"
                                                            : "fa-solid fa-archive"
                                                    }></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(w.id)}
                                                className="btn-archive"
                                                title="Eliminar">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-gray-400">
                        No hay palabras para mostrar.
                    </div>
                )}
            </div>

            {/* Modal de error */}
            {errorModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Error</h3>
                        <p>{errorModal}</p>
                        <button
                            onClick={() => setErrorModal(null)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition font-semibold rounded-md">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {confirmModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirmación</h3>
                        <p className="pb-4">{confirmModal.message}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition font-semibold rounded-md">
                                Cancelar
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition font-semibold rounded-md">
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para agregar palabra */}
            {addModal && (
                <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="modal bg-zinc-900 text-white p-8 rounded-xl shadow-md border border-zinc-700 max-w-md">
                        <h3 className="text-2xl font-bold mb-6 text-center">Agregar palabra</h3>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await handleAddWord(e);
                                setAddModal(false);
                            }}
                            className="flex flex-col gap-5">
                            <input
                                type="text"
                                placeholder="Palabra en inglés"
                                value={wordInput}
                                onChange={(e) => setWordInput(e.target.value)}
                                className="w-full px-4 py-3 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                placeholder="Significado / descripción"
                                value={meaningInput}
                                onChange={(e) => setMeaningInput(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setAddModal(false)}
                                    className="px-6 py-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition font-semibold rounded-md">
                                    Añadir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}