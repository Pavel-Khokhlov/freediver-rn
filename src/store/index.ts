import { useAuthStore } from './auth';
import { useGlobalUIStore } from './globalUI';

export const useStore = () => {
  return {
    authStore: useAuthStore(),
    globalUIStore: useGlobalUIStore(),
  };
};
