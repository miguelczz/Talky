import { about } from "../../assets/images";
import { Link } from "react-router-dom";

/**
 * Sección "Sobre Talky"
 * Presenta la descripción del proyecto y una imagen representativa.
 */
export default function About() {
    return (
        <section className="about-us-container">
            <div className="about-us">
                {/* Contenedor general con ancho máximo controlado */}
                <div className="about-wrapper">
                    <div className="about-row">
                        {/* Columna de texto */}
                        <div className="about-col-text">
                            <div className="content-about">
                                <h3 className="heading-about">Sobre Talky</h3>
                                {/* Primer párrafo descriptivo */}
                                <p className="para-about">
                                    Desarrollado como un proyecto innovador del
                                    Politécnico JIC, Talky busca acompañar a los
                                    estudiantes, integrando tecnología y
                                    pedagogía para promover la fluidez oral y
                                    escrita en inglés.
                                </p>
                                {/* Segundo párrafo descriptivo */}
                                <p className="para-about">
                                    Con acceso fácil desde cualquier
                                    dispositivo, Talky transforma el proceso de
                                    aprendizaje en una experiencia alineada con
                                    las competencias del mundo laboral
                                    globalizado.
                                </p>
                                {/* Enlace con ícono */}
                                <Link to="/about" className="link-about">
                                    <span className="span-about"></span>
                                    Leer más{" "}
                                    <span className="icon-arrow">
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Columna con imagen */}
                        <div className="about-col-image">
                            <img
                                src={about}
                                className="img-about"
                                alt="Sobre Talky"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
