import { getUsuarios } from '../api/admin.api.js';
import { getProfile, login } from '../api/auth.api.js';
import { saveSession, saveUser } from '../auth/session.service.js';
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

function extractToken(response) {
  return (
    response?.data?.access_token ??
    response?.data?.token ??
    response?.access_token ??
    response?.token ??
    null
  );
}

function extractUser(response) {
  return (
    response?.data?.usuario ??
    response?.data?.user ??
    response?.usuario ??
    response?.user ??
    response?.data ??
    response ??
    null
  );
}

function buildSafeUser({ correo, userFromLogin, userFromProfile, detectedRole }) {
  const baseUser = {
    ...(userFromLogin && typeof userFromLogin === 'object' ? userFromLogin : {}),
    ...(userFromProfile && typeof userFromProfile === 'object' ? userFromProfile : {}),
  };

  return {
    ...baseUser,
    correo: baseUser.correo ?? baseUser.email ?? correo,
    rol: detectedRole ?? baseUser.rol ?? baseUser.role ?? 'usuario',
  };
}

async function detectRole() {
  try {
    await getUsuarios();
    return 'admin';
  } catch (error) {
    if (error?.status === 403) {
      return 'usuario';
    }

    if (error?.status === 401) {
      return 'usuario';
    }

    return null;
  }
}

export function LoginPage() {
  return `
    <section class="container py-5" style="max-width: 520px;">
      <h1 class="mb-4">Iniciar sesión</h1>

      <form id="loginForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="correo">Correo</label>
          <input class="form-control" type="email" id="correo" name="correo" required />
        </div>

        <div class="mb-3">
          <label class="form-label" for="contrasena">Contraseña</label>
          <input class="form-control" type="password" id="contrasena" name="contrasena" required />
        </div>

        <button class="btn btn-dark" type="submit">Entrar</button>

        <p class="mt-3 mb-0 text-muted" id="loginMensaje"></p>

        <p class="mt-3 mb-0">
          <a href="#" data-view="registro">Crear una cuenta</a>
        </p>
      </form>
    </section>
  `;
}

export function mountLoginPage({ navigate } = {}) {
  const form = document.querySelector('#loginForm');
  const message = document.querySelector('#loginMensaje');

  if (!form || !message) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const correo = document.querySelector('#correo').value.trim();
    const contrasena = document.querySelector('#contrasena').value.trim();

    try {
      setMessage(message, 'Validando credenciales...', 'muted');

      const loginResponse = await login({ correo, contrasena });

      const token = extractToken(loginResponse);
      const userFromLogin = extractUser(loginResponse);

      if (!token) {
        setMessage(
          message,
          'El backend respondió, pero no se encontró el token en la respuesta.',
          'danger',
        );
        return;
      }

      saveSession(token, {
        correo,
        rol: 'usuario',
        ...(userFromLogin && typeof userFromLogin === 'object' ? userFromLogin : {}),
      });

      let userFromProfile = null;

      try {
        const profileResponse = await getProfile();
        userFromProfile = extractUser(profileResponse);
      } catch {
        userFromProfile = null;
      }

      const detectedRole = await detectRole();

      const finalUser = buildSafeUser({
        correo,
        userFromLogin,
        userFromProfile,
        detectedRole,
      });

      saveUser(finalUser);

      setMessage(message, 'Inicio de sesión exitoso.', 'success');

      window.setTimeout(() => {
        navigate?.('home');
      }, 700);
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible iniciar sesión.');
      const detailsMessage = getDetailsMessage(apiError.details);

      if (apiError.status === 401) {
        setMessage(message, apiError.message || 'Credenciales inválidas.', 'danger');
        return;
      }

      if (apiError.status === 400) {
        setMessage(message, detailsMessage || 'Revisa los campos enviados.', 'danger');
        return;
      }

      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });
}