import axios from 'axios';

const api = axios.create({
  baseURL: 'https://liveclass-xh6r.onrender.com/', // Adjust if your backend is on a different port
});

export const createClass = async (name: string, maxParticipants: number) => {
  const response = await api.post('/classes', { name, maxParticipants });
  return response.data;
};

export const joinClass = async (classId: string, identity: string) => {
  const response = await api.post(`/classes/${classId}/join`, { identity });
  return response.data;
};

export const startClass = async (classId: string) => {
  const response = await api.post(`/classes/${classId}/start`);
  return response.data;
};

export const stopClass = async (classId: string) => {
  const response = await api.post(`/classes/${classId}/stop`);
  return response.data;
};

// This is the new function to fetch all events for replay
export const getClassEvents = async (classId: string) => {
  const response = await api.get(`/classes/${classId}/events`);
  return response.data;
};

export default api;