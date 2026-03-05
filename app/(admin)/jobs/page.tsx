"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Layers, Plus, Users } from "lucide-react";
import {
  useGetJobListingsQuery,
  useGetAllApplicationsQuery,
} from "@/redux/api/jobBoardApi";
import { CATEGORIES } from "@/lib/constants";
import JobsPanel from "@/components/admin/JobsPanel";
import StatCard from "@/components/admin/StatCard";
import PageHeader from "@/components/admin/PageHeader";

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data: jobsData, isLoading: jobsLoading } = useGetJobListingsQuery({
    page,
    limit: 10,
    ...(searchTerm && { searchTerm }),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: applicationsData, isLoading: appsLoading } =
    useGetAllApplicationsQuery();

  const meta = jobsData?.meta;
  const jobs = jobsData?.data ?? [];
  const applications = applicationsData?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
      <PageHeader
        title="Job Listings"
        subtitle={`${meta?.total ?? 0} active listings across ${CATEGORIES.length} categories`}
        action={
          <Link
            href="/create"
            className="sm:hidden flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold h-9 px-4 rounded-lg transition-colors shadow-sm shadow-indigo-200/60 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Post
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <StatCard
          icon={Briefcase}
          label="Total Listings"
          value={meta?.total ?? 0}
          isLoading={jobsLoading}
          color="indigo"
          trend="+12%"
        />
        <StatCard
          icon={Users}
          label="Applications"
          value={applications.length}
          isLoading={appsLoading}
          color="emerald"
          trend="+8%"
        />
        <StatCard
          icon={Layers}
          label="Categories"
          value={CATEGORIES.length}
          isLoading={false}
          color="violet"
        />
      </div>

      <JobsPanel
        jobs={jobs}
        meta={meta}
        isLoading={jobsLoading}
        searchTerm={searchTerm}
        setSearchTerm={(s) => {
          setSearchTerm(s);
          setPage(1);
        }}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}
