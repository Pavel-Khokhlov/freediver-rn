import { create } from 'zustand';
import EncryptedStorage from 'react-native-encrypted-storage';

export const langs = ['en', 'ru'];
export type LangProps = 'en' | 'ru';

export interface UserLoginData {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  timePB: string;
  datePB: string;
}

export interface UserProps extends UserLoginData {
  token: string;
  created_at: Date;
}

interface AuthState {
  user: UserProps | null;
  appLang: LangProps;
  isLoading: boolean;
  isNavigationReady: boolean;
  isLogged: boolean;

  // Actions
  initializeApp: () => void;
  setAppLang: (value: LangProps) => void;
  setIsNavigationReady: (value: boolean) => void;
  checkAuth: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  loadLangFromStorage: () => Promise<void>;
  updateProfile: (data: UserLoginData) => Promise<void>;
  login: (data: UserLoginData) => Promise<void>;
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

  async loadLangFromStorage() {
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

  checkAuth: async () => {
    try {
      const session = await EncryptedStorage.getItem('user_session');

      if (session) {
        const userData = JSON.parse(session);

        if (userData && userData.token) {
          set({
            user: userData,
            isLogged: true,
          });
        } else {
          await get().logout();
        }
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      await get().logout();
    }
  },

  loadUserFromStorage: async () => {
    try {
      const session = await EncryptedStorage.getItem('user_session');

      if (session) {
        const userData = JSON.parse(session);
        set({
          user: userData,
          isLogged: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: Partial<UserLoginData>) => {
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
        'user_session',
        JSON.stringify(updatedUser),
      );

      // Обновляем стор
      set({ user: updatedUser });

      console.log('✅ User updated:', updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  },

  login: async (data: UserLoginData) => {
    try {
      const currentUser = get().user;

      if (currentUser && !currentUser.token) {
        const newToken = get().generateSimpleDateToken();

        if (newToken) {
          const updatedUser = {
            ...currentUser,
            token: newToken,
            created_at: new Date(),
          };

          await EncryptedStorage.setItem(
            'user_session',
            JSON.stringify(updatedUser),
          );

          set({
            user: updatedUser,
            isLogged: true,
          });
          return;
        }
      }

      // Создаем нового пользователя с токеном
      const newUser: UserProps = {
        ...data, // Все поля из UserLoginData
        token: get().generateSimpleDateToken(), // Генерируем токен
        created_at: new Date(), // Устанавливаем текущую дату
      };

      await EncryptedStorage.setItem('user_session', JSON.stringify(newUser));

      set({
        user: newUser,
        isLogged: true,
      });
    } catch (error) {
      console.error('Failed to save user session:', error);
      set({ isLogged: false });
    }
  },

  logout: async () => {
    try {
      const { user } = get();

      if (user) {
        const updatedUser = {
          ...user,
          token: '',
        };

        set({
          user: updatedUser,
          isLogged: false,
        });

        await EncryptedStorage.setItem(
          'user_session',
          JSON.stringify(updatedUser),
        );
      } else {
        set({ isLogged: false });
      }
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  deleteUser: async () => {
    try {
      await EncryptedStorage.removeItem('user_session');

      set({
        user: null,
        isLogged: false,
      });
    } catch (error) {
      console.error('Failed to remove user session:', error);
    }
  },

  // Синхронное действие (аналог action из MobX)
  setAppLangSync: (value: LangProps) => {
    set({ appLang: value });
  },

  // Асинхронное действие
  setAppLang: async (value: LangProps) => {
    try {
      // Сохраняем язык
      await EncryptedStorage.setItem('app_lang', value);

      // Обновляем состояние
      set({ appLang: value });

      // Обновляем язык у пользователя
      const { user } = get();
      if (user) {
        const updatedUser = { ...user, lang: value };
        await EncryptedStorage.setItem(
          'user_session',
          JSON.stringify(updatedUser),
        );
        set({ user: updatedUser });
      }

      console.log('Language updated to:', value);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  },
  initializeApp: async () => {
    await get().loadLangFromStorage();
    set({ isLoading: false });
  },
}));
