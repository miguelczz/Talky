import "../assets/css/pages/description.css";

export default function Description() {
  return (
    <section className="about-page">
      <div className="about-container">
        <h1 className="about-title">Talky</h1>
        <p className="about-intro">
          Talky es una aplicación web en desarrollo orientada a estudiantes de inglés.
          Este proyecto contiene la parte del frontend, desarrollada en React con Vite y TailwindCSS.
        </p>

        <h2 className="about-subtitle">Descripción general</h2>
        <p className="about-text">
          La aplicación funciona como un asistente conversacional que permite practicar inglés mediante chat interactivo.
          Incluye herramientas adicionales como un glosario de palabras y una tabla de verbos.
        </p>
        <p className="about-text">
          El sistema se conecta con <strong>n8n</strong> y la <strong>API de OpenAI</strong>,
          y utiliza <strong>AWS Cognito</strong> y <strong>Amplify</strong> para la autenticación de usuarios.
        </p>

        <h2 className="about-subtitle">Características del Frontend</h2>
        <ul className="about-list">
          <li>Chat interactivo conectado a la API (vía n8n).</li>
          <li>Autenticación de usuarios con AWS Cognito y Amplify.</li>
          <li>Componentes disponibles:
            <ul>
              <li>Chat funcional.</li>
              <li>Tabla de verbos regulares e irregulares.</li>
              <li>Glosario personalizado por usuario.</li>
              <li>Registro, inicio de sesión y recuperación de contraseña.</li>
            </ul>
          </li>
          <li>Interfaz moderna desarrollada con React + Vite + TailwindCSS.</li>
        </ul>

        <h2 className="about-subtitle">Tecnologías utilizadas</h2>
        <ul className="about-list">
          <li><strong>Framework:</strong> React + Vite</li>
          <li><strong>Estilos:</strong> TailwindCSS + CSS personalizado</li>
          <li><strong>Autenticación:</strong> AWS Amplify + Cognito</li>
          <li><strong>Integraciones:</strong> n8n + OpenAI</li>
        </ul>

        <p className="about-footer">
          Talky busca acompañar a los estudiantes integrando tecnología y pedagogía para
          promover la fluidez oral y escrita en inglés. Su objetivo es facilitar el
          aprendizaje de forma accesible, moderna y efectiva.
        </p>
      </div>
    </section>
  );
}
