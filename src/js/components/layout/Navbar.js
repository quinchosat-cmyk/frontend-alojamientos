import { getCurrentUser, isAdmin, isAuthenticated } from '../../auth/permissions.js';

function isActive(view, currentView) {
  return currentView === view ? 'active fw-semibold' : '';
}

function navLink(view, label, currentView) {
  return `
    <li class="nav-item">
      <a class="nav-link ${isActive(view, currentView)}" href="#" data-view="${view}">
        ${label}
      </a>
    </li>
  `;
}

export function Navbar(currentView = 'home') {
  const usuario = getCurrentUser();

  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-semibold" href="#" data-view="home">
          Alojamientos
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            ${navLink('home', 'Inicio', currentView)}
            ${navLink('comodidades', 'Comodidades', currentView)}

            ${
              isAuthenticated()
                ? `
                  ${
                    isAdmin()
                      ? navLink('admin', 'Usuarios', currentView)
                      : ''
                  }

                  <li class="nav-item dropdown">
                    <button
                      class="btn btn-outline-light dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Mi cuenta
                    </button>

                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <h6 class="dropdown-header">
                          ${usuario?.correo ?? 'Usuario'}
                        </h6>
                      </li>

                      <li>
                        <a class="dropdown-item ${isActive('perfil', currentView)}" href="#" data-view="perfil">
                          Perfil
                        </a>
                      </li>

                      <li><hr class="dropdown-divider"></li>

                      <li>
                        <button class="dropdown-item" type="button" data-action="logout">
                          Cerrar sesión
                        </button>
                      </li>
                    </ul>
                  </li>
                `
                : `
                  ${navLink('login', 'Login', currentView)}
                  ${navLink('registro', 'Registro', currentView)}
                `
            }
          </ul>
        </div>
      </div>
    </nav>
  `;
}