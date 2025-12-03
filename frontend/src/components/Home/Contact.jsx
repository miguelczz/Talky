import { useState } from "react";
import emailjs from "@emailjs/browser";
import "../../assets/css/pages/home.css";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [status, setStatus] = useState(""); // mensaje de confirmación o error

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const sendEmail = (e) => {
        e.preventDefault();

        // Llama al servicio EmailJS

        console.log("Datos enviados:", {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            fecha_envio: new Date().toLocaleString("es-CO", {
                dateStyle: "full",
                timeStyle: "short",
            }),
        });

        emailjs;
        emailjs
            .send(
                import.meta.env.VITE_SERVICE_ID,
                import.meta.env.VITE_TEMPLATE_ID,
                {
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    date: new Date().toLocaleString("es-CO", {
                        dateStyle: "full",
                        timeStyle: "short",
                    }),
                },
                import.meta.env.VITE_PUBLIC_KEY
            )
            .then(
                () => {
                    setStatus("¡Mensaje enviado correctamente!");
                    setFormData({ name: "", email: "", message: "" });
                },
                (error) => {
                    console.error("Error al enviar:", error);
                    setStatus("Ocurrió un error, inténtalo de nuevo.");
                }
            );
    };

    return (
        <section className="contact-form">
            <h3 className="heading-contact">Contáctanos</h3>

            <div className="w-full max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Formulario */}
                    <div>
                        <form className="form-origin" onSubmit={sendEmail}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Nombre completo"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <textarea
                                name="message"
                                className="form-control"
                                placeholder="Ingresa tu mensaje"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required></textarea>

                            {/* Mensaje de estado */}
                            {status && (
                                <p className="text-center text-sm text-gray-400">
                                    {status}
                                </p>
                            )}

                            <div className="text-center mt-4">
                                <button type="submit" className="btn-contact">
                                    ENVIAR
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Columna derecha */}
                    <div className="flex items-center">
                        <div className="content-contact">
                            <h2 className="heading-content">
                                Más sobre <span>Talky</span>
                            </h2>
                            <p className="para-content">
                                ¿Tienes dudas, sugerencias o quieres saber más
                                sobre Talky? ¡Estamos aquí para ayudarte!
                                Déjanos tu nombre, correo y mensaje.
                            </p>
                            <p className="para-content">
                                Nuestro equipo se pondrá en contacto contigo lo
                                más pronto posible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
