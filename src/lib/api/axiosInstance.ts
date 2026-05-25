/**
 * Clean Axios instance with base configuration.
 *
 * No interceptors are registered here. They are registered
 * separately via registerInterceptors() from the interceptors module.
 */

import axios from 'axios';

import { HTTP_TIMEOUT_MS } from '../../shared/constants';

import type { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});
