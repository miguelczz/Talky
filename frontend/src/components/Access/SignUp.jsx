import { useState } from "react";
import { signUp } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        birthdate: "",
        gender: "",
        phone_number: "",
    });
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        let formattedPhone = formData.phone_number.trim();
        if (!formattedPhone.startsWith("+")) {
            formattedPhone = "+57" + formattedPhone.replace(/^0+/, "");
        }

        try {
            await signUp({
                username: formData.email,
                password: formData.password,
                options: {
                    userAttributes: {
                        email: formData.email,
                        name: formData.name,
                        birthdate: formData.birthdate,
                        gender: formData.gender,
                        phone_number: formattedPhone,
                    },
                },
            });

            setMessage(
                "✅ Registro exitoso. Revisa tu correo para confirmar la cuenta."
            );
            setTimeout(() => navigate("/confirm"), 2000);
        } catch (error) {
            setMessage(error.message || "Error al registrarse");
        }
    };

    return (
        <main className="flex items-center justify-center h-screen bg-black text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-zinc-900 p-8 mb-5 rounded-xl shadow-md border border-zinc-700 w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Registro
                </h2>

                <label className="block mb-1 text-sm">Nombre completo</label>
                <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600"
                />

                <label className="block mb-1 text-sm">Correo electrónico</label>
                <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600"
                />

                <label className="block mb-1 text-sm">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600"
                />

                <label className="block mb-1 text-sm">
                    Fecha de nacimiento
                </label>
                <input
                    type="date"
                    name="birthdate"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600"
                />

                <label className="block mb-1 text-sm">Género</label>
                <select
                    name="gender"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mb-4 rounded-md bg-zinc-800 border border-zinc-600">
                    <option value="">Seleccione...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                </select>

                <label className="block mb-1 text-sm">
                    Celular
                </label>
                <input
                    type="tel"
                    name="phone_number"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mb-6 rounded-md bg-zinc-800 border border-zinc-600"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition font-semibold py-2 rounded-md">
                    Registrar
                </button>

                {message && (
                    <p className="mt-4 text-sm text-center text-blue-400">
                        {message}
                    </p>
                )}

                <p className="text-sm text-center mt-4 text-zinc-400">
                    ¿Ya tienes cuenta?{" "}
                    <a
                        href="/signin"
                        className="text-blue-400 hover:text-blue-300 font-medium">
                        Inicia sesión
                    </a>
                </p>
            </form>
        </main>
    );
}
