const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type AuthRole = "ADMINISTRADOR_SISTEMA" | "OPERADOR";

export interface AuthUser {
  id: string;
  fullName: string;
  dni: string;
  email: string;
  role: AuthRole;
  area: string;
  isActive: boolean;
}

interface BootstrapAdminPayload {
  fullName: string;
  dni: string;
  area: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface CreateUserPayload {
  fullName: string;
  dni: string;
  area: string;
  email: string;
  role: AuthRole;
  password: string;
  confirmPassword: string;
}

interface UpdateUserPayload {
  fullName?: string;
  dni?: string;
  area?: string;
  email?: string;
  role?: AuthRole;
  password?: string;
  confirmPassword?: string;
}

const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la operación");
  }

  return data as T;
};

export const getBootstrapStatus = async () => {
  const response = await fetch(`${API_URL}/api/auth/bootstrap-status`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  return parseApiResponse<{
    ok: boolean;
    hasUsers: boolean;
  }>(response);
};

export const bootstrapSystemAdmin = async (payload: BootstrapAdminPayload) => {
  const response = await fetch(`${API_URL}/api/auth/bootstrap-admin`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    user: AuthUser;
  }>(response);
};

export const login = async (payload: LoginPayload) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    user: AuthUser;
  }>(response);
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};

export const getMe = async () => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  return parseApiResponse<{
    ok: boolean;
    user: AuthUser;
  }>(response);
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};


export const listUsers = async () => {
  const response = await fetch(`${API_URL}/api/auth/users`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  return parseApiResponse<{
    ok: boolean;
    users: AuthUser[];
  }>(response);
};

export const createUser = async (payload: CreateUserPayload) => {
  const response = await fetch(`${API_URL}/api/auth/users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    user: AuthUser;
  }>(response);
};

export const updateUser = async (userId: string, payload: UpdateUserPayload) => {
  const response = await fetch(`${API_URL}/api/auth/users/${userId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    user: AuthUser;
  }>(response);
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const response = await fetch(`${API_URL}/api/auth/users/${userId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ isActive })
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    user: AuthUser;
  }>(response);
};
