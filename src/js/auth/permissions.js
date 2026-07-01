import { getUser, hasSession } from './session.service.js';

export function getCurrentUser() {
  return getUser();
}

export function getCurrentRole() {
  const role = getCurrentUser()?.rol ?? null;

  if (!role) {
    return null;
  }

  return String(role).trim().toLowerCase();
}

export function isAuthenticated() {
  return hasSession() && Boolean(getCurrentUser());
}

export function isAdmin() {
  return getCurrentRole() === 'admin';
}

export function canManageAlojamiento(alojamiento) {
  const currentUser = getCurrentUser();

  if (!currentUser || !alojamiento) {
    return false;
  }

  const currentUserId = Number(currentUser.id);
  const alojamientoUserId = Number(
    alojamiento.usuario_id ??
      alojamiento.user_id ??
      alojamiento.propietario_id ??
      alojamiento.usuario?.id,
  );

  return isAdmin() || currentUserId === alojamientoUserId;
}