import Cookies from "js-cookie";

const TOKEN_KEY = "auth_token";

export const cookieService = {
  // Tokenni cookie ichiga saqlash
  setToken: (token: string, options?: Cookies.CookieAttributes) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 kun saqlanadi (agar options bo'lmasa)
      ...options,
    });
  },

  // Tokenni olish
  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  // Tokenni o‘chirish
  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },
};
