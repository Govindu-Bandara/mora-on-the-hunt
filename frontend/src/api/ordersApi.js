import axiosClient from './axiosClient';

export async function submitOrder(formData) {
  const { data } = await axiosClient.post('/orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchOrders(params) {
  const { data } = await axiosClient.get('/orders', { params });
  return data;
}

export async function fetchOrder(orderId) {
  const { data } = await axiosClient.get(`/orders/${orderId}`);
  return data.order;
}

export async function updateOrderStatus(orderId, status) {
  const { data } = await axiosClient.patch(`/orders/${orderId}/status`, { status });
  return data.order;
}

export async function addOrderNote(orderId, text) {
  const { data } = await axiosClient.patch(`/orders/${orderId}/notes`, { text });
  return data.order;
}

export async function deleteOrder(orderId) {
  await axiosClient.delete(`/orders/${orderId}`);
}

export async function fetchPaymentSlipBlob(orderId) {
  const { data, headers } = await axiosClient.get(`/orders/${orderId}/payment-slip`, {
    responseType: 'blob',
  });
  return { blob: data, mimetype: headers['content-type'] };
}
