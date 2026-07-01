import { deleteAlojamiento, getAlojamientoById } from '../api/alojamientos.api.js';
import { canManageAlojamiento } from '../auth/permissions.js';
import { formatCurrency } from '../utils/formatters.js';

function extractAlojamiento(response) {
  return (
    response?.data?.alojamiento ??
    response?.data ??
    response?.alojamiento ??
    response ??
    null
  );
}

function renderComodidades(comodidades = []) {
  if (!Array.isArray(comodidades) || !comodidades.length) {
    return '';
  }

  return `
    <div class="mt-4">
      <h2 class="h5">Comodidades</h2>

      <div class="d-flex flex-wrap gap-2">
        ${comodidades
          .map((comodidad) => {
            const nombre = comodidad?.nombre ?? comodidad;
            return `<span class="badge text-bg-secondary">${nombre}</span>`;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderDetalle(alojamiento) {
  const canManage = canManageAlojamiento(alojamiento);

  return `
    <article class="card shadow-sm">
      <div class="card-body">
        <h1 class="h3">${alojamiento.titulo ?? 'Alojamiento sin título'}</h1>

        <p class="text-muted mb-1">
          ${alojamiento.ciudad ?? 'Ciudad no disponible'}
        </p>

        <p class="fw-semibold mb-3">
          ${formatCurrency(alojamiento.precio_noche)} / noche
        </p>

        <p>${alojamiento.descripcion ?? 'Sin descripción.'}</p>

        ${renderComodidades(alojamiento.comodidades)}

        ${
          canManage
            ? `
              <div class="mt-4 d-flex gap-2 flex-wrap">
                <a
                  class="btn btn-outline-secondary"
                  href="#"
                  data-view="alojamientos/${alojamiento.id}/editar"
                >
                  Editar
                </a>

                <button
                  class="btn btn-outline-danger"
                  type="button"
                  data-action="delete-alojamiento"
                  data-id="${alojamiento.id}"
                >
                  Eliminar
                </button>
              </div>
            `
            : ''
        }
      </div>
    </article>
  `;
}

export function AlojamientoDetallePage() {
  return `
    <section class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Detalle de alojamiento</h1>

        <a class="btn btn-outline-secondary" href="#" data-view="home">
          Volver
        </a>
      </div>

      <div id="detalleState" class="text-muted">
        Cargando detalle...
      </div>
    </section>
  `;
}

export async function mountAlojamientoDetallePage({ params, navigate } = {}) {
  const state = document.querySelector('#detalleState');
  const id = params?.id;

  if (!state || !id) {
    return;
  }

  let alojamientoActual = null;

  async function cargarDetalle() {
    try {
      state.textContent = 'Cargando detalle...';

      const response = await getAlojamientoById(id);
      alojamientoActual = extractAlojamiento(response);

      if (!alojamientoActual) {
        state.innerHTML = `
          <div class="alert alert-warning">
            No se encontró el alojamiento solicitado.
          </div>
        `;
        return;
      }

      state.innerHTML = renderDetalle(alojamientoActual);
    } catch (error) {
      state.innerHTML = `
        <div class="alert alert-danger">
          ${error.message ?? 'No fue posible cargar el detalle.'}
        </div>
      `;
    }
  }

  state.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-action="delete-alojamiento"]');

    if (!deleteButton) {
      return;
    }

    const confirmar = window.confirm('¿Seguro que deseas eliminar este alojamiento?');

    if (!confirmar) {
      return;
    }

    try {
      await deleteAlojamiento(deleteButton.dataset.id);

      state.innerHTML = `
        <div class="alert alert-success">
          Alojamiento eliminado correctamente.
        </div>
      `;

      window.setTimeout(() => {
        navigate?.('home');
      }, 900);
    } catch (error) {
      if (error.status === 401) {
        state.innerHTML = `
          <div class="alert alert-warning">
            Tu sesión no es válida. Inicia sesión nuevamente.
          </div>
        `;
        navigate?.('login');
        return;
      }

      if (error.status === 403) {
        state.innerHTML = `
          <div class="alert alert-danger">
            No tienes permisos para eliminar este alojamiento.
          </div>
        `;
        return;
      }

      state.innerHTML = `
        <div class="alert alert-danger">
          ${error.message ?? 'No fue posible eliminar el alojamiento.'}
        </div>
      `;
    }
  });

  cargarDetalle();
}