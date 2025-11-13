import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import "./styles/dashboard-complete.css";
import Dashboard from "./components/dashboard/Dashboard";
import Reports from "./components/reports/Reports";
import Sidebar from "./components/sidebar/Sidebar";

// Componente App principal
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [isLoading, setIsLoading] = React.useState(true);

  // Remover tela de loading após o componente montar
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) {
        loadingScreen.style.opacity = "0";
        loadingScreen.style.transition = "opacity 0.5s ease-out";
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "reports":
        return <Reports />;
      case "transactions":
        return (
          <div
            className="page-placeholder"
            style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}
          >
            📊 Transações - Em desenvolvimento
          </div>
        );
      case "goals":
        return (
          <div
            className="page-placeholder"
            style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}
          >
            🎯 Metas - Em desenvolvimento
          </div>
        );
      case "settings":
        return (
          <div
            className="page-placeholder"
            style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}
          >
            ⚙️ Configurações - Em desenvolvimento
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return null; // Não renderizar nada enquanto carrega
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content */}
      <div className="main-content">{renderPage()}</div>
    </div>
  );
};

// Mount React App
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const root = createRoot(container);

// Renderizar a aplicação
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
