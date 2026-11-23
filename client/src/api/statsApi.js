import request from './client';
import { toQuery } from '../utils/query';

export const revenueByMovie = (params) => request(`/stats/revenue-by-movie${toQuery(params)}`);
export const revenueByDay = (params) => request(`/stats/revenue-by-day${toQuery(params)}`);
export const overview = () => request('/stats/overview');