// Auth utility - API calls to backend

// Auth utility - API calls to backend

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'yearbook_token';
const USER_KEY = 'yearbook_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Register / Request Access
export async function requestAccess({ name, email, password, major, rollNo }) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, major, rollNo }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Sign In
export async function signIn({ email, password }) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Sign Out
export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Get current user from localStorage cache
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Verify token is still valid
export async function verifySession() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      signOut();
      return null;
    }
    const data = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  } catch {
    return getCurrentUser(); // Offline fallback
  }
}

// ==================== ADMIN ====================

export async function getPendingUsers() {
  try {
    const res = await fetch(`${API_URL}/admin/pending`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return [];
    return data.users;
  } catch {
    return [];
  }
}

export async function getApprovedUsers() {
  try {
    const res = await fetch(`${API_URL}/admin/approved`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return [];
    return data.users;
  } catch {
    return [];
  }
}

export async function getRejectedUsers() {
  try {
    const res = await fetch(`${API_URL}/admin/rejected`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return [];
    return data.users;
  } catch {
    return [];
  }
}

export async function approveUser(userId) {
  try {
    const res = await fetch(`${API_URL}/admin/approve/${userId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message || data.error };
  } catch {
    return { success: false, message: 'Network error.' };
  }
}

export async function rejectUser(userId) {
  try {
    const res = await fetch(`${API_URL}/admin/reject/${userId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message || data.error };
  } catch {
    return { success: false, message: 'Network error.' };
  }
}

export async function deleteUser(userId) {
  try {
    const res = await fetch(`${API_URL}/admin/user/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message || data.error };
  } catch {
    return { success: false, message: 'Network error.' };
  }
}

// ==================== MESSAGES ====================

export async function getStudentMessages(studentId) {
  try {
    const res = await fetch(`${API_URL}/messages/${studentId}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.messages;
  } catch {
    return [];
  }
}

export async function postStudentMessage(studentId, text) {
  try {
    const res = await fetch(`${API_URL}/messages/${studentId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message, error: data.error };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function deleteStudentMessage(id) {
  try {
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error.' };
  }
}

export async function deleteWallMessage(id) {
  try {
    const res = await fetch(`${API_URL}/wall/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error.' };
  }
}

// ==================== WALL ====================

export async function getWallMessages() {
  try {
    const res = await fetch(`${API_URL}/wall`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.messages;
  } catch {
    return [];
  }
}

export async function postWallMessage(text) {
  try {
    const res = await fetch(`${API_URL}/wall`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message, error: data.error };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

// ==================== PHOTOS ====================

// Get all student photos as a map { rollNo: base64DataUrl }
export async function getAllStudentPhotos() {
  try {
    const res = await fetch(`${API_URL}/photos`);
    const data = await res.json();
    if (!res.ok) return {};
    return data.photos;
  } catch {
    return {};
  }
}

// Upload own photo (FormData with 'photo' field)
export async function uploadMyPhoto(file) {
  try {
    const token = getToken();
    if (!token) return { success: false, error: 'Please sign in first.' };

    const formData = new FormData();
    formData.append('photo', file);

    const res = await fetch(`${API_URL}/photos/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message, rollNo: data.rollNo };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ==================== GALLERY ====================

export async function getGalleryPhotos() {
  try {
    const res = await fetch(`${API_URL}/gallery`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.photos;
  } catch {
    return [];
  }
}

export async function uploadGalleryPhoto(file, caption, category) {
  try {
    const token = getToken();
    if (!token) return { success: false, error: 'Please sign in.' };

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', caption);
    formData.append('category', category);

    const res = await fetch(`${API_URL}/gallery/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function deleteGalleryPhoto(id) {
  try {
    const res = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message || data.error };
  } catch {
    return { success: false, message: 'Network error.' };
  }
}

// ==================== JOURNEY ====================

export async function getJourneyEvents() {
  try {
    const res = await fetch(`${API_URL}/journey`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.events;
  } catch {
    return [];
  }
}

export async function uploadJourneyEvent(files, year, title, description, caption, order) {
  try {
    const token = getToken();
    if (!token) return { success: false, error: 'Please sign in.' };

    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    formData.append('year', year);
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('caption', caption || '');
    formData.append('order', String(order || 0));

    const res = await fetch(`${API_URL}/journey/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function editJourneyEvent(id, keptPhotos, files, year, title, description, caption, order) {
  try {
    const token = getToken();
    if (!token) return { success: false, error: 'Please sign in.' };

    const formData = new FormData();
    formData.append('keptPhotos', JSON.stringify(keptPhotos));
    if (files && files.length > 0) {
      files.forEach(file => formData.append('photos', file));
    }
    formData.append('year', year);
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('caption', caption || '');
    formData.append('order', String(order || 0));

    const res = await fetch(`${API_URL}/journey/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Network error.' };
  }
}

export async function deleteJourneyEvent(id) {
  try {
    const res = await fetch(`${API_URL}/journey/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return { success: res.ok, message: data.message || data.error };
  } catch {
    return { success: false, message: 'Network error.' };
  }
}
