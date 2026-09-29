import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Headers helper
const getHeaders = (userId = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['user-id'] = userId;
  }
  return headers;
};

// Auth API
export const authAPI = {
  register: (userData) =>
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  login: (email, password) =>
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
  googleLogin: (token) =>
    axios.post(`${API_BASE_URL}/auth/google`, { token }),
  verifyEmail: (userId) =>
    axios.post(`${API_BASE_URL}/auth/verify/${userId}`),
};

// User API
export const userAPI = {
  getAllUsers: () => axios.get(`${API_BASE_URL}/users`),
  getUserById: (id) => axios.get(`${API_BASE_URL}/users/${id}`),
  getUserByEmail: (email) => axios.get(`${API_BASE_URL}/users/email/${email}`),
  getUsersByRole: (role) => axios.get(`${API_BASE_URL}/users/role/${role}`),
  updateUser: (id, userData) => axios.put(`${API_BASE_URL}/users/${id}`, userData),
  deleteUser: (id) => axios.delete(`${API_BASE_URL}/users/${id}`),
  getTotalUsersCount: () => axios.get(`${API_BASE_URL}/users/count/total`),
};

// FarmHouse API
export const farmhouseAPI = {
  addFarmHouse: (data, ownerId) =>
    axios.post(`${API_BASE_URL}/farmhouses`, data, {
      headers: { ...getHeaders(), 'owner-id': ownerId },
    }),
  getAllFarmHouses: (page = 0, size = 10) =>
    axios.get(`${API_BASE_URL}/farmhouses?page=${page}&size=${size}`),
  getAllFarmHousesAdmin: (page = 0, size = 10) =>
    axios.get(`${API_BASE_URL}/farmhouses/all?page=${page}&size=${size}`),
  getFarmHouseById: (id) => axios.get(`${API_BASE_URL}/farmhouses/${id}`),
  getFarmHousesByOwner: (ownerId) =>
    axios.get(`${API_BASE_URL}/farmhouses/owner/${ownerId}`),
  searchByLocation: (query, page = 0, size = 10) =>
    axios.get(
      `${API_BASE_URL}/farmhouses/search/location?query=${query}&page=${page}&size=${size}`
    ),
  searchByPrice: (minPrice, maxPrice, page = 0, size = 10) =>
    axios.get(
      `${API_BASE_URL}/farmhouses/search/price?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`
    ),
  updateFarmHouse: (id, data, requesterId) =>
    axios.put(`${API_BASE_URL}/farmhouses/${id}`, data, {
      headers: { 'owner-id': requesterId },
    }),
  approveFarmHouse: (id) =>
    axios.put(`${API_BASE_URL}/farmhouses/${id}/approve`),
  deleteFarmHouse: (id, requesterId) =>
    axios.delete(`${API_BASE_URL}/farmhouses/${id}`, {
      headers: { 'owner-id': requesterId },
    }),
};

// Booking API
export const bookingAPI = {
  createBooking: (data, userId) =>
    axios.post(`${API_BASE_URL}/bookings`, data, {
      headers: getHeaders(userId),
    }),
  getBookingById: (id) => axios.get(`${API_BASE_URL}/bookings/${id}`),
  getAllBookings: () => axios.get(`${API_BASE_URL}/bookings`),
  getUserBookings: (userId) =>
    axios.get(`${API_BASE_URL}/bookings/user/${userId}`),
  getFarmHouseBookings: (farmHouseId) =>
    axios.get(`${API_BASE_URL}/bookings/farmhouse/${farmHouseId}`),
  confirmBooking: (id) =>
    axios.put(`${API_BASE_URL}/bookings/${id}/confirm`),
  cancelBooking: (id) =>
    axios.put(`${API_BASE_URL}/bookings/${id}/cancel`),
  checkAvailability: (farmHouseId, startDate, endDate, timeSlot = 'AM') =>
    axios.get(
      `${API_BASE_URL}/bookings/check/availability?farmHouseId=${farmHouseId}&startDate=${startDate}&endDate=${endDate}&timeSlot=${timeSlot}`
    ),
  deleteBooking: (id) => axios.delete(`${API_BASE_URL}/bookings/${id}`),
};

// Payment API
export const paymentAPI = {
  createPayment: (data) =>
    axios.post(`${API_BASE_URL}/payments`, data),
  processPayment: (id) =>
    axios.post(`${API_BASE_URL}/payments/${id}/process`),
  getPaymentById: (id) => axios.get(`${API_BASE_URL}/payments/${id}`),
  getPaymentByBooking: (bookingId) =>
    axios.get(`${API_BASE_URL}/payments/booking/${bookingId}`),
  getAllPayments: () => axios.get(`${API_BASE_URL}/payments`),
  getPaymentsByStatus: (status) =>
    axios.get(`${API_BASE_URL}/payments/status/${status}`),
  refundPayment: (id) =>
    axios.post(`${API_BASE_URL}/payments/${id}/refund`),
};

// Review API
export const reviewAPI = {
  getReviewsForFarmHouse: (farmHouseId) =>
    axios.get(`${API_BASE_URL}/reviews/farmhouse/${farmHouseId}`),
  createReview: (data, userId) =>
    axios.post(`${API_BASE_URL}/reviews`, data, {
      headers: getHeaders(userId),
    }),
};

// Discount API
export const discountAPI = {
  // Public – no auth required
  getActiveDiscounts: () =>
    axios.get(`${API_BASE_URL}/discounts/active`),

  // Admin – all discounts
  getAllDiscounts: (requesterId) =>
    axios.get(`${API_BASE_URL}/discounts`, {
      headers: { 'requester-id': requesterId },
    }),

  // Owner – their own discounts
  getDiscountsByOwner: (ownerId, requesterId) =>
    axios.get(`${API_BASE_URL}/discounts/owner/${ownerId}`, {
      headers: { 'requester-id': requesterId },
    }),

  // Create (Owner/Admin)
  createDiscount: (data, requesterId) =>
    axios.post(`${API_BASE_URL}/discounts`, data, {
      headers: { 'requester-id': requesterId, 'Content-Type': 'application/json' },
    }),

  // Update (Creator/Admin)
  updateDiscount: (id, data, requesterId) =>
    axios.put(`${API_BASE_URL}/discounts/${id}`, data, {
      headers: { 'requester-id': requesterId, 'Content-Type': 'application/json' },
    }),

  // Delete (Creator/Admin)
  deleteDiscount: (id, requesterId) =>
    axios.delete(`${API_BASE_URL}/discounts/${id}`, {
      headers: { 'requester-id': requesterId },
    }),
};
