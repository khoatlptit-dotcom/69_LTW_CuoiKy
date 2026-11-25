import request from './client';
import { toQuery } from '../utils/query';

export const getAll = (params) => request(`/admin/bookings${toQuery(params)}`);