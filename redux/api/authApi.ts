import { baseApi } from "./baseApi";

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

interface GetUsersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    data: AdminUser[];
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /auth/logout
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /auth/refresh-token
    refreshToken: builder.mutation<
      {
        statusCode: number;
        success: boolean;
        data: { accessToken: string; refreshToken: string };
      },
      void
    >({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
        data: (() => {
          try {
            const rt =
              typeof window !== "undefined"
                ? localStorage.getItem("refreshToken")
                : null;
            return rt ? { refreshToken: rt } : {};
          } catch {
            return {};
          }
        })(),
      }),
    }),

    // GET /auth/users  (admin / superAdmin only)
    getUsers: builder.query<
      GetUsersResponse,
      { page?: number; limit?: number; searchTerm?: string }
    >({
      query: (params) => ({
        url: "/auth/users",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    // PATCH /auth/change-role
    changeRole: builder.mutation<
      { success: boolean; message: string },
      { email: string; newRole: string }
    >({
      query: (data) => ({
        url: "/auth/change-role",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["User"],
    }),

    // DELETE /auth/delete-user/:id  (superAdmin)
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({
          url: `/auth/delete-user/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["User"],
      },
    ),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetUsersQuery,
  useChangeRoleMutation,
  useDeleteUserMutation,
} = authApi;
