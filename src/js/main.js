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

function matchRoutePattern(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

function findRoute(path) {
  const normalizedPath = normalizeView(path);

  for (const route of routes) {
    const params = matchRoutePattern(route.path, normalizedPath);

    if (params) {
      return {
        ...route,
        params,
      };
    }

    const aliasMatch = route.aliases?.find((alias) => alias === normalizedPath);

    if (aliasMatch) {
      return {
        ...route,
        params: {},
      };
    }
  }

  return null;
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

  currentView = normalizedPath;

  const pageHtml = route.page?.(route.params) ?? '';

  renderPageShell(route, pageHtml);

  route.mount?.({
    navigate,
    render: renderRoute,
    params: route.params,
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