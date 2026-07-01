import { getAlojamientoById, updateAlojamiento } from '../api/alojamientos.api.js';
import { canManageAlojamiento } from '../auth/permissions.js';
import { AlojamientoForm } from '../components/alojamientos/AlojamientoForm.js';

function extractAlojamiento(response) {
  return (
    response?.data?.alojamiento ??
    response?.data ??
    response?.alojamiento ??
    response ??
    null
  );
}

function setMessage(element, text, tone = 'muted') {
  if (!element) {
    return;
  }

  element.className = `mt-3 mb-0 text-${tone}`;
  element.textContent = text;
}

export function EditarAlojamientoPage({ id } = {}) {
  return `
    <section class="container py-5" style="max-width: 760px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0">Editar alojamiento</h1>

        <a class="btn btn-outline-secondary" href="#" data-view="alojamientos/${id}">
          Volver
        </a>
      </div>

      <div id="editarAlojamientoState" class="text-muted">
        Cargando datos...
      </div>
    </section>
  `;
}

export async function mountEditarAlojamientoPage({ params, navigate } = {}) {
  const state = document.querySelector('#editarAlojamientoState');
  const id = params?.id;

  if (!state || !id) {
    return;
  }

  try {
    state.textContent = 'Cargando datos...';

    const response = await getAlojamientoById(id);
    const alojamiento = extractAlojamiento(response);

    if (!alojamiento) {
      state.innerHTML = `
        <div class="alert alert-warning">
          No se encontró el alojamiento solicitado.
        </div>
      `;
      return;
    }

    if (!canManageAlojamiento(alojamiento)) {
      state.innerHTML = `
        <div class="alert alert-danger">
          No tienes permisos para editar este alojamiento.
        </div>
      `;
      return;
    }

    state.innerHTML = AlojamientoForm({
      values: alojamiento,
      submitLabel: 'Actualizar',
    });

    const form = document.querySelector('#alojamientoForm');
    const mensaje = document.querySelector('#alojamientoMensaje');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const titulo = document.querySelector('#titulo').value.trim();
      const descripcion = document.querySelector('#descripcion').value.trim();
      const precio_noche = Number(document.querySelector('#precio_noche').value);
      const ciudad = document.querySelector('#ciudad').value.trim();

      try {
        setMessage(mensaje, 'Actualizando alojamiento...', 'muted');

        await updateAlojamiento(id, {
          titulo,
          descripcion,
          precio_noche,
          ciudad,
        });

        setMessage(mensaje, 'Alojamiento actualizado correctamente.', 'success');

        window.setTimeout(() => {
          navigate?.(`alojamientos/${id}`);
        }, 900);
      } catch (error) {
        if (error.status === 401) {
          setMessage(mensaje, 'Tu sesión no es válida. Inicia sesión nuevamente.', 'danger');
          navigate?.('login');
          return;
        }

        if (error.status === 403) {
          setMessage(mensaje, 'No tienes permisos para editar este alojamiento.', 'danger');
          return;
        }

        if (error.status === 400) {
          setMessage(mensaje, 'Revisa los datos enviados.', 'danger');
          return;
        }

        setMessage(mensaje, error.message ?? 'No fue posible actualizar el alojamiento.', 'danger');
      }
    });
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
          No tienes permisos para editar este alojamiento.
        </div>
      `;
      return;
    }

    state.innerHTML = `
      <div class="alert alert-danger">
        ${error.message ?? 'No fue posible cargar el alojamiento.'}
      </div>
    `;
  }
}