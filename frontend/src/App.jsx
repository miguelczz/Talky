import Navbar from "./components/Navbar";
import Routes from "./routes/Routes";
import './assets/css/base/_global.css';
import { useAuth } from "./components/Access/AuthContext";

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                Cargando sesión...
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <main className="px-20">
                <div className="max-w-7xl mx-auto w-full">
                    <Routes />
                </div>
            </main>
        </div>
    );
}

export default App;
