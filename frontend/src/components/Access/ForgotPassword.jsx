import { useState } from "react";
import { resetPassword } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await resetPassword({ username: email });
      setMessage({
        type: "success",
        text: "📧 Código enviado. Revisa tu correo.",
      });
      setTimeout(() => navigate("/reset"), 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Error al enviar el código.",
      });
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-black text-white -mt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl w-full max-w-sm shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Recuperar contraseña</h1>

        {message && (
          <p className={`text-center text-sm mb-4 ${message.type === "error" ? "text-red-400" : "text-blue-400"}`}>
            {message.text}
          </p>
        )}

        <label className="block mb-2 text-sm">Correo electrónico</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition font-semibold py-2 rounded-md"
        >
          Enviar código
        </button>
      </form>
    </main>
  );
}
