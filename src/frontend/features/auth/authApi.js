import { apiRequest } from '../../../services/apiClient.js'

export function registerUser(input) {

  return apiRequest('/auth/register', {

    method: 'POST',

    body: input,

  })

}

export function loginUser(input) {

  return apiRequest('/auth/login', {

    method: 'POST',

    body: input,

  })

}

export function requestPasswordReset(input) {

  return apiRequest('/auth/forgot-password', {

    method: 'POST',

    body: input,

  })

}


export function resetPassword(input) {

  return apiRequest('/auth/reset-password', {

    method: 'POST',

    body: input,

  })

}

export function logoutUser(token) {

  return apiRequest('/auth/logout', {

    method: 'POST',

    token,

  })

}

export function getCurrentUser(token) {

  return apiRequest('/auth/me', {

    token,

  })

}


// =========================================================
// ONLINE HEARTBEAT
// =========================================================

export function sendHeartbeat(token) {

  return apiRequest('/auth/heartbeat', {

    method: 'POST',

    token,

  })

}


export function checkAdminAccess(token) {

  return apiRequest('/auth/admin-check', {

    token,

  })

}