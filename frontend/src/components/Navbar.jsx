import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { signOut } from "@aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Access/AuthContext";

import "../assets/css/components/navbar.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const { user, setUser, setAmplifyUser, isStudent, isTeacher, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const adminDropdownRef = useRef(null);

    // Cerrar dropdowns al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
                setAdminDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
            setAmplifyUser(null);
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Si no hay usuario o se está en /chat, mostrar placeholder para mantener espacio
    if (!user || location.pathname.startsWith("/chat")) {
        return <div className="navbar-placeholder"></div>;
    }


    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container flex justify-between items-center py-3">
                <Link to="/" className="navbar-brand logo">
                    Talky
                </Link>

                <button
                    className="lg:hidden text-2xl mt-2"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu">
                    ☰
                </button>

                <ul
                    className={`navbar-nav flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-4 lg:mt-0 ${
                        isOpen ? "flex" : "hidden lg:flex"
                    }`}>
                    {/* Sección: Herramientas de Aprendizaje */}
                    <li className="nav-item">
                        <Link to="/chat" className="nav-link">
                            Chat
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/verbs" className="nav-link">
                            Verbos
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/glossary" className="nav-link">
                            Glosario
                        </Link>
                    </li>

                    {/* Separador visual (solo en desktop) */}
                    <li className="hidden lg:block nav-item">
                        <span className="text-gray-600">|</span>
                    </li>

                    {/* Sección: Cursos (Enlace directo) */}
                    {(isStudent || isTeacher || isAdmin) && (
                        <li className="nav-item">
                            <Link to="/courses" className="nav-link">
                                Cursos
                            </Link>
                        </li>
                    )}

                    {/* Sección: Panel Administrador (Dropdown) */}
                    {isAdmin && (
                        <li className="nav-item relative" ref={adminDropdownRef}>
                            <button
                                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                                className="nav-link flex items-center gap-2"
                            >
                                <span>Panel Administrador</span>
                                <i className={`fas ${adminDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-xs`}></i>
                            </button>
                            {adminDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg min-w-[200px] z-50 overflow-hidden">
                                    <Link
                                        to="/admin/stats"
                                        className="block px-4 py-2.5 hover:bg-zinc-800 transition text-sm"
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Estadísticas
                                    </Link>
                                    <Link
                                        to="/admin/users"
                                        className="block px-4 py-2.5 hover:bg-zinc-800 transition text-sm"
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Usuarios
                                    </Link>
                                    <Link
                                        to="/admin/assignments"
                                        className="block px-4 py-2.5 hover:bg-zinc-800 transition text-sm"
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Asignaciones
                                    </Link>
                                    <Link
                                        to="/courses"
                                        className="block px-4 py-2.5 hover:bg-zinc-800 transition text-sm"
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Cursos
                                    </Link>
                                    <Link
                                        to="/admin/roles"
                                        className="block px-4 py-2.5 hover:bg-zinc-800 transition text-sm"
                                        onClick={() => setAdminDropdownOpen(false)}
                                    >
                                        Roles
                                    </Link>
                                </div>
                            )}
                        </li>
                    )}

                    {/* Separador visual (solo en desktop) */}
                    <li className="hidden lg:block nav-item">
                        <span className="text-gray-600">|</span>
                    </li>

                    {/* Perfil del usuario */}
                    <li className="nav-item">
                        <Link
                            to="/profile"
                            className="nav-link font-medium text-blue-400 hover:text-blue-300 transition">
                            {user.name}
                        </Link>
                    </li>

                    {/* Botón de cerrar sesión */}
                    <li className="nav-item">
                        <button
                            onClick={handleLogout}
                            className="nav-link text-red-400 hover:text-red-300 transition"
                            title="Cerrar sesión"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
