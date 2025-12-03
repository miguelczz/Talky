import { Link } from "react-router-dom";
import { useState } from "react";

// Recursos gráficos
import conversation from "../../assets/images/conversation.png";
import verbs from "../../assets/images/verbs.png";
import glossary from "../../assets/images/glossary.png";
import exams from "../../assets/images/exams.png";
import lessons from "../../assets/images/lessons.png";

/**
 * Carrusel de servicios.
 * Muestra las distintas funciones disponibles en la plataforma.
 */
export default function ServicesCarousel() {
    // Datos estáticos del carrusel
    const services = [
        {
            title: "Chat",
            text: "Intercambia mensajes con un asistente virtual...",
            link: "/chat",
            img: conversation,
        },
        {
            title: "Tabla de verbos",
            text: "Aprende una gran cantidad de verbos regulares e irregulares...",
            link: "/verbs",
            img: verbs,
        },
        {
            title: "Glosario",
            text: "Crea tu propio vocabulario y aprende tantas palabras como quieras...",
            link: "/glossary",
            img: glossary,
        },
        {
            title: "Exámenes",
            text: "Pon a prueba tus conocimientos aprendidos...",
            link: "/exam_list",
            img: exams,
        },
        {
            title: "Lecciones",
            text: "Aprende sobre las estructuras y bases del lenguaje...",
            link: "/lesson_list",
            img: lessons,
        },
    ];

    // Estado del carrusel
    const [currentSlide, setCurrentSlide] = useState(0);
    const cardsPerSlide = 3;
    const totalSlides = Math.ceil(services.length / cardsPerSlide);

    // Navegación del carrusel
    const handlePrev = () => {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
    };

    // Obtiene los elementos visibles del slide actual
    const getSlideItems = () => {
        const start = currentSlide * cardsPerSlide;
        return services.slice(start, start + cardsPerSlide);
    };

    return (
        <section className="service-category">
            <h2 className="heading-service text-center">Servicios</h2>

            <div className="relative w-full px-4">
                {/* Grid de tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {getSlideItems().map((service, index) => (
                        <div key={index} className="card card-service">
                            <img
                                src={service.img}
                                alt={service.title}
                                className="img-card mx-auto"
                            />

                            <div className="card-body">
                                <h5 className="card-title">{service.title}</h5>
                                <p className="card-text my-3">{service.text}</p>
                                <Link
                                    to={service.link}
                                    className="btn-service-ctg">
                                    CONOCER{" "}
                                    <i className="fa-solid fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controles de navegación */}
                <button
                    onClick={handlePrev}
                    className="absolute top-1/2 -translate-y-1/2 left-[-70px] z-20 w-9 h-9 flex items-center justify-center"
                    aria-label="Anterior">
                    <i className="button-left fa-solid fa-arrow-left"></i>
                </button>

                <button
                    onClick={handleNext}
                    className="absolute top-1/2 -translate-y-1/2 right-[-70px] z-20 w-9 h-9 flex items-center justify-center"
                    aria-label="Siguiente">
                    <i className="button-right fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </section>
    );
}
