import { getItem, removeItem, saveItem } from '../utils/storage.js';

const TOKEN_KEY = 'frontend_alojamientos_access_token';
const USER_KEY = 'frontend_alojamientos_user';

function unwrapUser(value) {
  return (
    value?.data?.usuario ??
    value?.data?.user ??
    value?.usuario ??
    value?.user ??
    value?.data ??
    value ??
    null
  );
}

function normalizeUser(value, previousUser = null) {
  const rawUser = unwrapUser(value);

  if (!rawUser || typeof rawUser !== 'object') {
    return previousUser;
  }

  return {
    ...previousUser,
    ...rawUser,

    id:
      rawUser.id ??
      rawUser.usuario_id ??
      rawUser.user_id ??
      previousUser?.id ??
      null,

    correo:
      rawUser.correo ??
      rawUser.email ??
      previousUser?.correo ??
      '',

    rol:
      rawUser.rol ??
      rawUser.role ??
      rawUser.tipo_rol ??
      previousUser?.rol ??
      'usuario',

    nombre:
      rawUser.nombre ??
      previousUser?.nombre ??
      '',

    apellido:
      rawUser.apellido ??
      previousUser?.apellido ??
      '',

    telefono:
      rawUser.telefono ??
      previousUser?.telefono ??
      '',
  };
}

export function saveToken(token) {
  saveItem(TOKEN_KEY, token);
}

export function getToken() {
  return getItem(TOKEN_KEY);
}

export function saveUser(user) {
  const previousUser = getItem(USER_KEY);
  const normalizedUser = normalizeUser(user, previousUser);

  saveItem(USER_KEY, normalizedUser);
}

export function getUser() {
  const storedUser = getItem(USER_KEY);

  return normalizeUser(storedUser, null);
}

export function saveSession(token, user) {
  saveToken(token);
  saveUser(user);
}

export function clearSession() {
  removeItem(TOKEN_KEY);
  removeItem(USER_KEY);
}

export function hasSession() {
  return Boolean(getToken());
}