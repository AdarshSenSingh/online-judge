import axios from 'axios';

const API_URL = 'http://localhost:5000/problems';

export const getProblems = () => axios.get(API_URL);
export const getProblem = (id) => axios.get(`${API_URL}/${id}`);
export const createProblem = (data) => axios.post(API_URL, data);
export const updateProblem = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteProblem = (id) => axios.delete(`${API_URL}/${id}`);
