import { getAlojamientos } from '../api/alojamientos.api.js';
import { isAuthenticated } from '../auth/permissions.js';
import { AlojamientoCard } from '../components/alojamientos/AlojamientoCard.js';

function extractAlojamientos(response) {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.alojamientos)) {
    return response.data.alojamientos;
  }

  if (Array.isArray(response?.alojamientos)) {
    return response.alojamientos;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

export function AlojamientosPage() {
  return `
    <section class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="mb-1">Alojamientos</h1>
          <p class="text-muted mb-0">
            Explora los alojamientos disponibles.
          </p>
        </div>

        ${
          isAuthenticated()
            ? `
              <a class="btn btn-primary" href="#" data-view="alojamientos/nuevo">
                Crear alojamiento
              </a>
            `
            : ''
        }
      </div>

      <div id="alojamientosState" class="text-muted">
        Cargando alojamientos...
      </div>
    </section>
  `;
}

export async function mountAlojamientosPage() {
  const state = document.querySelector('#alojamientosState');

  if (!state) {
    return;
  }

  try {
    state.textContent = 'Cargando alojamientos...';

    const response = await getAlojamientos();
    const alojamientos = extractAlojamientos(response);

    if (!alojamientos.length) {
      state.innerHTML = `
        <div class="alert alert-info">
          No hay alojamientos para mostrar.
        </div>
      `;
      return;
    }

    state.innerHTML = `
      <div class="row g-4">
        ${alojamientos
          .map(
            (alojamiento) => `
              <div class="col-md-6 col-lg-4">
                ${AlojamientoCard(alojamiento)}
              </div>
            `,
          )
          .join('')}
      </div>
    `;
  } catch (error) {
    state.innerHTML = `
      <div class="alert alert-danger">
        ${error.message ?? 'No fue posible cargar los alojamientos.'}
      </div>
    `;
  }
}