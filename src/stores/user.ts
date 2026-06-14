import { defineStore } from 'pinia';

interface UserState {
  username: string;
  avatar: string;
  token: string | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    username: '',
    avatar: '',
    token: localStorage.getItem('THOR_TOKEN'),
    isLoggedIn: !!localStorage.getItem('THOR_TOKEN'),
  }),

  actions: {
    login(username: string, token: string) {
      this.username = username;
      this.token = token;
      this.isLoggedIn = true;
      localStorage.setItem('THOR_TOKEN', token);
    },

    logout() {
      this.username = '';
      this.token = null;
      this.isLoggedIn = false;
      localStorage.removeItem('THOR_TOKEN');
    },

    // 可以后续扩展从后端获取用户信息
    fetchUserInfo() {
      // TODO: 调用后端 API 获取用户信息
    }
  }
});