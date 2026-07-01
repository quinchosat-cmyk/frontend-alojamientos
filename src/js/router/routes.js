import { AdminUsuariosPage, mountAdminUsuariosPage } from '../pages/AdminUsuariosPage.js';
import { AlojamientoDetallePage, mountAlojamientoDetallePage } from '../pages/AlojamientoDetallePage.js';
import { AlojamientosPage, mountAlojamientosPage } from '../pages/AlojamientosPage.js';
import { CrearAlojamientoPage, mountCrearAlojamientoPage } from '../pages/CrearAlojamientoPage.js';
import { EditarAlojamientoPage, mountEditarAlojamientoPage } from '../pages/EditarAlojamientoPage.js';
import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from '../pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from '../pages/RegistroPage.js';

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
    page: AlojamientosPage,
    mount: mountAlojamientosPage,
    public: true,
  },
  {
    path: 'alojamientos',
    page: AlojamientosPage,
    mount: mountAlojamientosPage,
    public: true,
  },
  {
    path: 'alojamientos/nuevo',
    page: CrearAlojamientoPage,
    mount: mountCrearAlojamientoPage,
    requiresAuth: true,
  },
  {
    path: 'alojamientos/:id/editar',
    page: EditarAlojamientoPage,
    mount: mountEditarAlojamientoPage,
    requiresAuth: true,
  },
  {
    path: 'alojamientos/:id',
    page: AlojamientoDetallePage,
    mount: mountAlojamientoDetallePage,
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