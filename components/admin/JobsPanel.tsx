"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useDeleteJobMutation } from "@/redux/api/jobBoardApi";
import { CATEGORY_STYLES, TYPE_STYLES } from "@/lib/constants";
import { fmtShort } from "@/lib/format";
import CompanyAvatar from "./CompanyAvatar";
import EmptyState from "./EmptyState";
import SkeletonRows from "./SkeletonRows";

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  salary?: string;
  createdAt: string;
}

export interface JobMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface JobsPanelProps {
  jobs: Job[];
  meta?: JobMeta;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
}

export default function JobsPanel({
  jobs,
  meta,
  isLoading,
  searchTerm,
  setSearchTerm,
  page,
  setPage,
}: JobsPanelProps) {
  const router = useRouter();
  const [deleteJob] = useDeleteJobMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?\n\nThis action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteJob(id).unwrap();
      toast.success(`"${title}" removed`);
    } catch {
      toast.error("Failed to delete — please try again");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/60">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search listings…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {meta?.total != null && (
            <span className="text-[12px] text-slate-400 font-medium hidden sm:block">
              {meta.total.toLocaleString()} result{meta.total !== 1 ? "s" : ""}
            </span>
          )}
          <Link
            href="/create"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold h-8 px-3 rounded-lg transition-colors shadow-sm shadow-indigo-200/60"
          >
            <Plus className="w-3.5 h-3.5" />
            New Listing
          </Link>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <SkeletonRows />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title={
            searchTerm ? `No results for "${searchTerm}"` : "No listings yet"
          }
          description={
            searchTerm
              ? "Try adjusting your search or clearing the filter."
              : "Create your first job listing to start attracting candidates."
          }
          action={
            !searchTerm
              ? {
                  label: "Post your first job",
                  onClick: () => router.push("/create"),
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {["Job & Company", "Category", "Type", "Posted", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 last:text-right"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <motion.tr
                    key={job._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.025, duration: 0.2 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={job.company} />
                        <div>
                          <p className="font-semibold text-[13px] text-slate-900 leading-tight">
                            {job.title}
                          </p>
                          <p className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {job.company}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {job.location}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${CATEGORY_STYLES[job.category] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {job.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_STYLES[job.type] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}
                      >
                        {job.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {fmtShort(job.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(job._id, job.title)}
                        disabled={deletingId === job._id}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all disabled:opacity-50"
                        aria-label={`Delete ${job.title}`}
                      >
                        {deletingId === job._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="px-4 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <CompanyAvatar name={job.company} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[13px] text-slate-900 leading-tight">
                        {job.title}
                      </p>
                      <button
                        onClick={() => handleDelete(job._id, job.title)}
                        disabled={deletingId === job._id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all shrink-0 disabled:opacity-50"
                      >
                        {deletingId === job._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {job.company} · {job.location}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_STYLES[job.category] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {job.category}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[job.type] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {job.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPage > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <span className="text-[12px] text-slate-500">
                Page{" "}
                <strong className="text-slate-700 font-semibold">
                  {meta.page}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-700 font-semibold">
                  {meta.totalPage}
                </strong>
                <span className="hidden sm:inline text-slate-400">
                  {" "}
                  · {meta.total.toLocaleString()} total
                </span>
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= meta.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
