// /client/src/types/Auth.ts

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  healthGoals: string[];
  avatarUrl?: string | null;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (formData: any) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  updateProfile?: (data: any) => Promise<User | void>;
}