"use client";

import { Briefcase, Layers, Users } from "lucide-react";
import {
  useGetJobListingsQuery,
  useGetAllApplicationsQuery,
} from "@/redux/api/jobBoardApi";
import { CATEGORIES } from "@/lib/constants";
import ApplicationsPanel from "@/components/admin/ApplicationsPanel";
import StatCard from "@/components/admin/StatCard";
import PageHeader from "@/components/admin/PageHeader";

export default function ApplicationsPage() {
  const { data: jobsData, isLoading: jobsLoading } = useGetJobListingsQuery({
    page: 1,
    limit: 1,
  });
  const { data: applicationsData, isLoading: appsLoading } =
    useGetAllApplicationsQuery();

  const applications = applicationsData?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
      <PageHeader
        title="Applications"
        subtitle={`${applications.length} candidate application${applications.length !== 1 ? "s" : ""} received`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <StatCard
          icon={Briefcase}
          label="Total Listings"
          value={jobsData?.meta?.total ?? 0}
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

      <ApplicationsPanel applications={applications} isLoading={appsLoading} />
    </div>
  );
}
