import Hero from "../components/Home/Hero";
import About from "../components/Home/About";
import Services from "../components/Home/Services";
import Contact from "../components/Home/Contact";

export default function Home() {
    return (
        <>
            {/* HERO */}
            <Hero />

            {/* ABOUT */}
            <About />

            {/* SERVICIOS */}
            <Services />

            {/* CONTACT US */}
            <Contact />

            {/* FOOTER */}
            <footer className="w-full text-center py-4 px-20 bg-black text-white">
                <p className="para-footer">© CopyRights By Talky 2025</p>
            </footer>
        </>
    );
}
