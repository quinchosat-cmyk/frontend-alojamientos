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