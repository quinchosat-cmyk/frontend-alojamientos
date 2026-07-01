import { createAlojamiento } from '../api/alojamientos.api.js';
import { AlojamientoForm } from '../components/alojamientos/AlojamientoForm.js';

function setMessage(element, text, tone = 'muted') {
  if (!element) {
    return;
  }

  element.className = `mt-3 mb-0 text-${tone}`;
  element.textContent = text;
}

export function CrearAlojamientoPage() {
  return `
    <section class="container py-5" style="max-width: 760px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0">Nuevo alojamiento</h1>

        <a class="btn btn-outline-secondary" href="#" data-view="home">
          Volver
        </a>
      </div>

      ${AlojamientoForm({ submitLabel: 'Crear' })}
    </section>
  `;
}

export function mountCrearAlojamientoPage({ navigate } = {}) {
  const form = document.querySelector('#alojamientoForm');
  const mensaje = document.querySelector('#alojamientoMensaje');

  if (!form || !mensaje) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titulo = document.querySelector('#titulo').value.trim();
    const descripcion = document.querySelector('#descripcion').value.trim();
    const precio_noche = Number(document.querySelector('#precio_noche').value);
    const ciudad = document.querySelector('#ciudad').value.trim();

    try {
      setMessage(mensaje, 'Creando alojamiento...', 'muted');

      await createAlojamiento({
        titulo,
        descripcion,
        precio_noche,
        ciudad,
      });

      setMessage(mensaje, 'Alojamiento creado correctamente.', 'success');

      window.setTimeout(() => {
        navigate?.('home');
      }, 900);
    } catch (error) {
      if (error.status === 401) {
        setMessage(mensaje, 'Tu sesión no es válida. Inicia sesión nuevamente.', 'danger');
        navigate?.('login');
        return;
      }

      if (error.status === 400) {
        setMessage(mensaje, 'Revisa los datos enviados.', 'danger');
        return;
      }

      setMessage(mensaje, error.message ?? 'No fue posible crear el alojamiento.', 'danger');
    }
  });
}