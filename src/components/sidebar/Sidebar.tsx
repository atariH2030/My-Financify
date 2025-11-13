import React from "react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [theme, setTheme] = React.useState("light");

  React.useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Add cool transition effect
    document.body.style.transition = "all 0.5s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 500);
  };

  const logout = () => {
    // Implementar logout no futuro
    alert("Função de logout será implementada em breve!");
  };

  return (
    <div className="vscode-sidebar">
      <div className="sidebar-header">
        <h3>
          <i className="fas fa-chart-line"></i> My Financify
        </h3>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Alternar tema"
        >
          <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <a
              href="#"
              className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange("dashboard");
              }}
            >
              <i className="fas fa-home"></i> Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-item ${currentPage === "reports" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange("reports");
              }}
            >
              <i className="fas fa-chart-bar"></i> Relatórios
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-item ${currentPage === "transactions" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange("transactions");
              }}
            >
              <i className="fas fa-exchange-alt"></i> Transações
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-item ${currentPage === "goals" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange("goals");
              }}
            >
              <i className="fas fa-bullseye"></i> Metas
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-item ${currentPage === "settings" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onPageChange("settings");
              }}
            >
              <i className="fas fa-cog"></i> Configurações
            </a>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-info">
            <span className="user-name">Usuário</span>
            <small className="user-email">usuario@email.com</small>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <i className="fas fa-sign-out-alt"></i> Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
