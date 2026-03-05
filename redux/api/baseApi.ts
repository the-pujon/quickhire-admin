import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

// Base API with shared configuration
// Module-specific APIs inject endpoints into this
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: [
    "Auth",
    "User",
    "UserStats",
    "Job",
    "Jobs",
    "JobStats",
    "FollowUp",
    "Note",
    "Timeline",
    "Analytics",
    "Dashboard",
    "Subscription",
    "Payments",
  ],
  endpoints: () => ({}),
});
