import { useState } from "react";
import { confirmResetPassword } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      setMessage({ type: "success", text: "Contraseña actualizada. Redirigiendo..." });
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "No se pudo restablecer." });
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-black text-white -mt-10">
      <form
        onSubmit={handleReset}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl w-full max-w-sm shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Restablecer contraseña</h1>

        {message && (
          <p className={`text-center text-sm mb-4 ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
            {message.text}
          </p>
        )}

        <label className="block mb-2 text-sm">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600 text-white"
        />

        <label className="block mb-2 text-sm">Código de verificación</label>
        <input
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600 text-white"
        />

        <label className="block mb-2 text-sm">Nueva contraseña</label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-md bg-zinc-800 border border-zinc-600 text-white"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition font-semibold py-2 rounded-md"
        >
          Restablecer
        </button>
      </form>
    </main>
  );
}
