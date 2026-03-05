"use client";

import { useRouter } from "next/navigation";
import CreateJobPanel from "@/components/admin/CreateJobPanel";
import PageHeader from "@/components/admin/PageHeader";

export default function CreateJobPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
      <PageHeader
        title="Post New Job"
        subtitle="Fill in the details below to publish a new job listing"
      />
      <CreateJobPanel onSuccess={() => router.push("/jobs")} />
    </div>
  );
}
