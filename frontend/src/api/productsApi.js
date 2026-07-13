import axiosClient from './axiosClient';

export async function fetchProducts(category) {
  const { data } = await axiosClient.get('/products', { params: category ? { category } : {} });
  return data.products;
}

export async function fetchProduct(id) {
  const { data } = await axiosClient.get(`/products/${id}`);
  return data.product;
}

export async function createProduct(payload) {
  const { data } = await axiosClient.post('/products', payload);
  return data.product;
}

export async function updateProduct(id, payload) {
  const { data } = await axiosClient.put(`/products/${id}`, payload);
  return data.product;
}

export async function uploadProductImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const { data } = await axiosClient.post('/products/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.images;
}

export async function reorderProductImages(id, images) {
  const { data } = await axiosClient.patch(`/products/${id}/images`, { images });
  return data.product;
}

export async function deleteProduct(id) {
  await axiosClient.delete(`/products/${id}`);
}
