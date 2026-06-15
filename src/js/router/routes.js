import { getCurrentUser, isAdmin, isAuthenticated } from '../auth/permissions.js';
import { AdminUsuariosPage, mountAdminUsuariosPage } from '../pages/AdminUsuariosPage.js';
import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from '../pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from '../pages/RegistroPage.js';

function HomePage() {
  const usuario = getCurrentUser();

  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9 py-4">
          <p class="text-uppercase text-primary fw-semibold mb-2">
            Frontend Alojamientos
          </p>

          <h1 class="display-6 mb-3">
            SPA con roles y guards
          </h1>

          <p class="text-muted mb-4">
            Esta base ya maneja autenticación, autorización, rutas protegidas y navegación por rol.
          </p>

          ${
            isAuthenticated()
              ? `
                <div class="alert alert-info">
                  Sesión iniciada como <strong>${usuario?.correo ?? 'usuario'}</strong>.
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <a class="btn btn-primary" href="#" data-view="perfil">
                    Ir a mi perfil
                  </a>

                  ${
                    isAdmin()
                      ? `
                        <a class="btn btn-outline-dark" href="#" data-view="admin">
                          Ver usuarios
                        </a>
                      `
                      : ''
                  }
                </div>
              `
              : `
                <div class="d-flex flex-wrap gap-2">
                  <a class="btn btn-primary" href="#" data-view="login">
                    Iniciar sesión
                  </a>

                  <a class="btn btn-outline-secondary" href="#" data-view="registro">
                    Crear cuenta
                  </a>
                </div>
              `
          }
        </div>
      </div>
    </section>
  `;
}

function ComodidadesPlaceholderPage() {
  return `
    <section class="container py-5">
      <h1 class="h3 mb-3">Comodidades</h1>
      <p class="text-muted">
        Esta sección queda reservada para un sprint posterior.
      </p>
    </section>
  `;
}

export const routes = [
  {
    path: 'home',
    page: HomePage,
    public: true,
  },
  {
    path: 'login',
    page: LoginPage,
    mount: mountLoginPage,
    public: true,
  },
  {
    path: 'registro',
    page: RegistroPage,
    mount: mountRegistroPage,
    public: true,
  },
  {
    path: 'comodidades',
    page: ComodidadesPlaceholderPage,
    public: true,
  },
  {
    path: 'perfil',
    page: PerfilPage,
    mount: mountPerfilPage,
    requiresAuth: true,
  },
  {
    path: 'admin',
    page: AdminUsuariosPage,
    mount: mountAdminUsuariosPage,
    requiresAuth: true,
    requiresAdmin: true,
  },
  {
    path: 'admin-usuarios',
    aliases: ['admin/usuarios'],
    page: AdminUsuariosPage,
    mount: mountAdminUsuariosPage,
    requiresAuth: true,
    requiresAdmin: true,
  },
];