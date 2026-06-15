import { getProfile, updateProfile } from '../api/auth.api.js';
import { getUser, saveUser } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

function getDetailsMessage(details) {
  if (!details) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    return details.filter(Boolean).join(' ');
  }

  if (typeof details === 'object') {
    return Object.values(details)
      .flat()
      .filter(Boolean)
      .join(' ');
  }

  return '';
}

function setMessage(element, text, tone = 'muted') {
  if (!element) {
    return;
  }

  element.className = `mt-3 mb-0 text-${tone}`;
  element.textContent = text;
}

function extractUser(response) {
  return (
    response?.data ??
    response?.usuario ??
    response?.user ??
    response ??
    null
  );
}

export function PerfilPage() {
  const user = getUser();

  return `
    <section class="container py-5" style="max-width: 720px;">
      <h1 class="mb-4">Perfil</h1>

      <div class="alert alert-info">
        <strong>Correo:</strong> ${user?.correo ?? 'No disponible'}
      </div>

      <form id="perfilForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="nombre">Nombre</label>
          <input class="form-control" type="text" id="nombre" name="nombre" value="" required />
        </div>

        <div class="mb-3">
          <label class="form-label" for="apellido">Apellido</label>
          <input class="form-control" type="text" id="apellido" name="apellido" value="" required />
        </div>

        <div class="mb-3">
          <label class="form-label" for="telefono">Teléfono</label>
          <input class="form-control" type="tel" id="telefono" name="telefono" value="" />
        </div>

        <button class="btn btn-primary" type="submit">Actualizar</button>

        <p class="mt-3 mb-0 text-muted" id="perfilMensaje"></p>
      </form>
    </section>
  `;
}

export function mountPerfilPage({ navigate } = {}) {
  const form = document.querySelector('#perfilForm');
  const message = document.querySelector('#perfilMensaje');
  const nombreInput = document.querySelector('#nombre');
  const apellidoInput = document.querySelector('#apellido');
  const telefonoInput = document.querySelector('#telefono');

  if (!form || !message || !nombreInput || !apellidoInput || !telefonoInput) {
    return;
  }

  async function cargarPerfil() {
    try {
      setMessage(message, 'Cargando perfil...', 'muted');

      const response = await getProfile();
      const perfil = extractUser(response);

      nombreInput.value = perfil?.nombre ?? '';
      apellidoInput.value = perfil?.apellido ?? '';
      telefonoInput.value = perfil?.telefono ?? '';

      if (perfil) {
        saveUser(perfil);
      }

      setMessage(message, '', 'muted');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar el perfil.');

      if (apiError.status === 401) {
        setMessage(message, 'La sesión expiró. Inicia sesión nuevamente.', 'danger');
        navigate?.('login');
        return;
      }

      const detailsMessage = getDetailsMessage(apiError.details);
      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const telefono = telefonoInput.value.trim();

    try {
      setMessage(message, 'Actualizando perfil...', 'muted');

      const response = await updateProfile({
        nombre,
        apellido,
        telefono,
      });

      const updatedUser = extractUser(response);

      if (updatedUser) {
        saveUser(updatedUser);
      }

      setMessage(message, 'Datos básicos del perfil actualizados correctamente.', 'success');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible actualizar el perfil.');

      if (apiError.status === 401) {
        setMessage(message, 'Sesión inválida. Vuelve a iniciar sesión.', 'danger');
        navigate?.('login');
        return;
      }

      const detailsMessage = getDetailsMessage(apiError.details);

      if (apiError.status === 400) {
        setMessage(message, detailsMessage || 'Revisa los campos enviados.', 'danger');
        return;
      }

      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });

  cargarPerfil();
}