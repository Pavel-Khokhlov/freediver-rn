import { create } from 'zustand';
import EncryptedStorage from 'react-native-encrypted-storage';

export const langs = ['en', 'ru'];
export type LangProps = 'en' | 'ru';

export interface UserProps {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  timePB: string;
  datePB: string;
  created_at: Date;
}

interface AuthState {
  user: UserProps | null;
  token: string | null;
  appLang: LangProps;
  isLoading: boolean;
  isNavigationReady: boolean;
  isLogged: boolean;

  // Actions
  initializeApp: () => void;
  setAppLang: (value: LangProps) => void;
  setIsNavigationReady: (value: boolean) => void;
  loadUserFromStorage: () => Promise<void>;
  loadLangFromStorage: () => Promise<void>;
  updateProfile: (data: UserProps) => Promise<void>;
  login: (data: UserProps) => Promise<void>;
  logout: () => Promise<void>;
  // editUser: (params: EditUserParams) => Promise<void>;
  /*   editAvatar: (
    avatar: string,
    title: string,
    message: string,
  ) => Promise<void>; */
  deleteUser: () => Promise<void>;

  // Helper (internal use)
  generateSimpleDateToken: () => string;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  user: null,
  token: null,
  appLang: 'en',
  isLoading: true,
  isNavigationReady: false,
  isLogged: false,

  // Helper method
  generateSimpleDateToken: () => {
    const date = new Date().getTime();
    return `Bearer-${date}`;
  },

  // Actions (реализации те же, что и выше)
  setIsNavigationReady: (value: boolean) => {
    set({ isNavigationReady: value });
  },

  loadLangFromStorage: async () => {
    try {
      const lang = await EncryptedStorage.getItem('app_lang');
      if (lang) {
        set({
          appLang: lang as LangProps,
        });
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  },

  loadUserFromStorage: async () => {
    try {
      const current_user = await EncryptedStorage.getItem('freediver_user');
      const current_token = await EncryptedStorage.getItem('freediver_token');

      if (current_user) {
        const userData = await JSON.parse(current_user);
        set({
          user: userData,
          isLogged: current_token ? true : false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: Partial<UserProps>) => {
    try {
      const { user } = get();

      if (!user) {
        console.error('No user found');
        return;
      }

      // Просто перезаписываем user с новыми данными
      const updatedUser = {
        ...user,
        ...data, // Новые данные перезаписывают старые
      };

      // Сохраняем в storage
      await EncryptedStorage.setItem(
        'freediver_user',
        JSON.stringify(updatedUser),
      );

      // Обновляем стор
      set({ user: updatedUser });

      console.log('✅ User updated:', updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  },

  login: async (data: UserProps) => {
    try {
      const currentUser = get().user;
      const currentToken = get().token;

      if (currentUser && !currentToken) {
        const newToken = get().generateSimpleDateToken();

        if (newToken) {
          const updatedUser = {
            ...currentUser,
            created_at: new Date(),
          };

          await EncryptedStorage.setItem(
            'freediver_user',
            JSON.stringify(updatedUser),
          );

          await EncryptedStorage.setItem(
            'freediver_token',
            JSON.stringify(newToken),
          );

          set({
            user: updatedUser,
            isLogged: true,
            token: newToken,
          });
          return;
        }
      }

      // Создаем нового пользователя с токеном
      const newUser: UserProps = {
        ...data,
        created_at: new Date(),
      };

      const newToken = get().generateSimpleDateToken();

      await EncryptedStorage.setItem('freediver_user', JSON.stringify(newUser));
      await EncryptedStorage.setItem(
        'freediver_token',
        JSON.stringify(newToken),
      );

      set({
        user: newUser,
        isLogged: true,
        token: newToken,
      });
    } catch (error) {
      console.error('Failed to save user session:', error);
      set({ isLogged: false });
    }
  },

  logout: async () => {
    try {
      await EncryptedStorage.removeItem('freediver_token');
      set({
        token: null,
        isLogged: false,
      });
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  deleteUser: async () => {
    try {
      await EncryptedStorage.removeItem('freediver_user');
      await EncryptedStorage.removeItem('freediver_token');

      set({
        user: null,
        token: null,
        isLogged: false,
      });
    } catch (error) {
      console.error('Failed to remove user session:', error);
    }
  },

  // Асинхронное действие
  setAppLang: async (value: LangProps) => {
    try {
      // Сохраняем язык
      await EncryptedStorage.setItem('app_lang', value);

      // Обновляем состояние
      set({ appLang: value });

      console.log('Language updated to:', value);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  },
  initializeApp: async () => {
    await get().loadUserFromStorage();
    await get().loadLangFromStorage();
    set({ isLoading: false });
  },
}));
