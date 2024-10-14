// src/utils/auth.ts

import {jwtDecode} from 'jwt-decode';

export interface JwtPayload {
  user: {
    userId: string | null | undefined;
    role: string;
    email: string;
  };
}

export const getUserFromToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};
