import { baseApi } from "./baseApi";

//     Types     ─

export interface JobListing {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListingsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: JobListing[];
}

export interface JobDetailResponse {
  success: boolean;
  message: string;
  data: JobListing;
}

export interface JobListingsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  location?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateJobPayload {
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  description: string;
  requirements: string[];
  salary?: string;
}

export interface ApplicationItem {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        company: string;
        location: string;
      };
  name: string;
  email: string;
  resumeLink: string;
  coverNote: string;
  createdAt: string;
}

export interface ApplicationsResponse {
  success: boolean;
  message: string;
  data: ApplicationItem[];
}

//     API

export const jobBoardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all job listings with filters
    getJobListings: builder.query<JobListingsResponse, JobListingsParams>({
      query: (params) => ({
        url: "/jobs",
        method: "GET",
        params,
      }),
      providesTags: ["Jobs"],
    }),

    // Get single job details
    getJobDetail: builder.query<JobDetailResponse, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Job", id }],
    }),

    // Create a job (Admin)
    createJob: builder.mutation<JobDetailResponse, CreateJobPayload>({
      query: (data) => ({
        url: "/jobs",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Jobs"],
    }),

    // Delete a job (Admin)
    deleteJob: builder.mutation<JobDetailResponse, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Jobs"],
    }),

    // Get all applications (Admin)
    getAllApplications: builder.query<ApplicationsResponse, void>({
      query: () => ({
        url: "/applications",
        method: "GET",
      }),
    }),

    // Get applications by job ID (Admin)
    getApplicationsByJob: builder.query<ApplicationsResponse, string>({
      query: (jobId) => ({
        url: `/applications/job/${jobId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetJobListingsQuery,
  useGetJobDetailQuery,
  useCreateJobMutation,
  useDeleteJobMutation,
  useGetAllApplicationsQuery,
  useGetApplicationsByJobQuery,
} = jobBoardApi;
