export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: "client" | "admin";
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type SafeAuthResponse = {
  user: User;
};

export type BackendAuthResponse = SafeAuthResponse & {
  access_token: string;
  token_type: string;
};
