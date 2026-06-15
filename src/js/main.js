import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

import { clearSession } from './auth/session.service.js';
import { Navbar } from './components/layout/Navbar.js';
import { requireAdmin, requireAuth } from './router/guards.js';
import { routes } from './router/routes.js';

const app = document.querySelector('#app');

let currentView = 'home';

function normalizeView(view) {
  const normalized = String(view ?? 'home')
    .trim()
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '');

  return normalized || 'home';
}

function findRoute(path) {
  const normalizedPath = normalizeView(path);

  return routes.find((route) => {
    if (route.path === normalizedPath) {
      return true;
    }

    return route.aliases?.includes(normalizedPath);
  });
}

function renderNotFoundPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h1 class="h3 mb-3">Página no encontrada</h1>
              <p class="text-muted mb-4">
                La vista solicitada no está disponible en esta SPA.
              </p>
              <a class="btn btn-primary" href="#" data-view="home">
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderForbiddenPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="alert alert-danger shadow-sm" role="alert">
            <h1 class="h4">Acceso denegado</h1>
            <p class="mb-0">
              No tienes permisos para acceder a esta sección.
            </p>
          </div>

          <a class="btn btn-primary" href="#" data-view="home">
            Volver al inicio
          </a>
        </div>
      </div>
    </section>
  `;
}

function renderPageShell(route, pageHtml) {
  app.innerHTML = `
    ${Navbar(route?.path ?? currentView)}
    <main id="page-root">
      ${pageHtml}
    </main>
  `;
}

function handleDeniedAccess(reason) {
  if (reason === 'login') {
    navigate('login');
    return;
  }

  if (reason === 'forbidden') {
    currentView = 'forbidden';

    app.innerHTML = `
      ${Navbar(currentView)}
      <main id="page-root">
        ${renderForbiddenPage()}
      </main>
    `;
  }
}

function renderRoute(path = currentView) {
  const normalizedPath = normalizeView(path);
  const route = findRoute(normalizedPath);

  if (!route) {
    currentView = 'not-found';

    app.innerHTML = `
      ${Navbar(currentView)}
      <main id="page-root">
        ${renderNotFoundPage()}
      </main>
    `;

    return;
  }

  if (route.requiresAdmin && !requireAdmin(handleDeniedAccess)) {
    return;
  }

  if (route.requiresAuth && !requireAuth(handleDeniedAccess)) {
    return;
  }

  currentView = route.path;

  const pageHtml = route.page?.() ?? '';

  renderPageShell(route, pageHtml);

  route.mount?.({
    navigate,
    render: renderRoute,
    view: currentView,
  });
}

function navigate(view = 'home') {
  renderRoute(normalizeView(view));
}

app.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');

  if (viewLink) {
    event.preventDefault();
    navigate(viewLink.dataset.view);
    return;
  }

  const logoutButton = event.target.closest('[data-action="logout"]');

  if (logoutButton) {
    clearSession();
    navigate('home');
  }
});

navigate(currentView);