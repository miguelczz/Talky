import { Link } from "react-router-dom";
import { useAuth } from "../../components/Access/AuthContext";

/**
 * Sección principal (Hero)
 * Muestra la animación Spline y las llamadas a la acción iniciales.
 */
export default function Hero() {
    const { user } = useAuth();

    return (
        <section className="container w-full flex items-center justify-center bg-black px-4">
            <div className="content-home w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                {/* Animación principal */}
                <div className="w-full">
                    <iframe
                        src="https://my.spline.design/meeet-N7APWa2GQqwh9h1bMZjoGto3/"
                        className="frame-home w-full h-[500px] rounded-md"
                        frameBorder="0"
                        allowFullScreen></iframe>
                </div>

                {/* Contenido de texto y botones */}
                <div className="box-container space-y-6">
                    <h1 className="home-heading">
                        <span className="home-span">Talky</span> tu mentor en el
                        aprendizaje
                    </h1>

                    <p className="para-home">
                        ¡Domina el inglés con lecciones interactivas basadas en
                        IA! Mejora tu pronunciación, gramática y vocabulario a
                        través de conversaciones reales y componentes de
                        práctica.
                    </p>

                    {!user ? (
                        <div className="flex gap-4 flex-wrap">
                            <Link to="/signin" className="home-links">
                                Iniciar sesión
                            </Link>
                            <Link to="/signup" className="home-links btn-2">
                                Registrarse
                            </Link>
                        </div>
                    ) : (
                        <Link to="/lesson_list" className="home-links">
                            Comenzar
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
