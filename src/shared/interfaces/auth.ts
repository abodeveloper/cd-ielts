export interface LoginDto {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  token: string;
}
