import axiosClient from './axiosClient';

export async function login(email, password, rememberMe) {
  const { data } = await axiosClient.post('/auth/login', { email, password, rememberMe });
  return data;
}

export async function fetchMe() {
  const { data } = await axiosClient.get('/auth/me');
  return data.admin;
}

export async function fetchAdmins() {
  const { data } = await axiosClient.get('/admin/admins');
  return data.admins;
}

export async function createAdmin(payload) {
  const { data } = await axiosClient.post('/admin/admins', payload);
  return data.admin;
}

export async function deleteAdmin(id) {
  await axiosClient.delete(`/admin/admins/${id}`);
}

export async function resetAdminPassword(id, password) {
  await axiosClient.patch(`/admin/admins/${id}/reset-password`, { password });
}

export async function fetchAnalytics() {
  const { data } = await axiosClient.get('/admin/analytics');
  return data;
}

export async function fetchDistributionBreakdown() {
  const { data } = await axiosClient.get('/admin/distribution-breakdown');
  return data;
}
