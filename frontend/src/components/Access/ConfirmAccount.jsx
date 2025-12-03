import { useState } from "react";
import { confirmSignUp, resendSignUpCode } from "@aws-amplify/auth";
import { Link, useNavigate } from "react-router-dom";

export default function ConfirmAccount() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleConfirm = async (e) => {
        e.preventDefault();
        try {
            await confirmSignUp({
                username: email,
                confirmationCode: code,
            });
            setMessage({ type: "info", text: "Cuenta confirmada. Redirigiendo..." });
            setTimeout(() => navigate("/signin"), 1500);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "Error al confirmar la cuenta.",
            });
        }
    };

    const handleResend = async () => {
        try {
            await resendSignUpCode({ username: email });
            setMessage({ type: "info", text: "Código de confirmación reenviado." });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "No se pudo reenviar el código.",
            });
        }
    };

    const getMessageColor = (type) => {
        switch (type) {
            case "success":
                return "text-green-500";
            case "error":
                return "text-red-500";
            case "info":
                return "text-blue-400";
            case "warning":
                return "text-yellow-400";
            default:
                return "text-white";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white -mt-10">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">
                <h1 className="text-center text-2xl font-bold mb-6">
                    Confirmar cuenta
                </h1>

                {message && (
                    <p className={`text-center text-sm mb-4 ${getMessageColor(message.type)}`}>
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleConfirm}>
                    <div className="mb-4">
                        <label className="block mb-1 text-sm" htmlFor="email">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            required
                            placeholder="ejemplo@correo.com"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-sm" htmlFor="code">
                            Código de verificación
                        </label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            required
                            placeholder="Código enviado a tu correo"
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 transition font-semibold text-white py-2 rounded-md mb-3">
                        Confirmar
                    </button>

                    <button
                        type="button"
                        onClick={handleResend}
                        className="w-full text-sm font-medium text-blue-400 hover:text-blue-300 transition hover:no-underline">
                        Reenviar código
                    </button>

                    <p className="text-center text-sm mt-5">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            to="/signin"
                            className="text-blue-400 hover:text-blue-300 font-semibold hover:no-underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
