"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import { getInitials, fmtDate } from "@/lib/format";
import EmptyState from "./EmptyState";

export interface Application {
  _id: string;
  jobId:
    | string
    | { _id: string; title: string; company: string; location: string };
  name: string;
  email: string;
  resumeLink: string;
  coverNote: string;
  createdAt: string;
}

interface ApplicationsPanelProps {
  applications: Application[];
  isLoading: boolean;
}

export default function ApplicationsPanel({
  applications,
  isLoading,
}: ApplicationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded-md w-36" />
                <div className="h-3 bg-slate-100 rounded-md w-52" />
              </div>
              <div className="h-7 w-20 bg-slate-100 rounded-lg hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm shadow-slate-100/60">
        <EmptyState
          icon={Users}
          title="No applications yet"
          description="Once candidates start applying to your listings, their applications will show up here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app, idx) => {
        const jobInfo =
          typeof app.jobId === "object"
            ? app.jobId
            : { title: "Unknown Job", company: "", _id: app.jobId };
        const expanded = expandedId === app._id;

        return (
          <motion.div
            key={app._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.035, duration: 0.22 }}
            className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md hover:shadow-slate-100/60 transition-shadow duration-200"
          >
            <div className="px-5 py-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-[12px] font-bold text-indigo-700 shrink-0 select-none">
                  {getInitials(app.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="font-semibold text-[14px] text-slate-900 leading-tight">
                        {app.name}
                      </h4>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {app.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <a
                        href={app.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Resume
                      </a>
                      <button
                        onClick={() => setExpandedId(expanded ? null : app._id)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Cover Note
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-700 bg-slate-50 ring-1 ring-slate-100 rounded-lg px-2.5 py-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {jobInfo.title}
                    </span>
                    {jobInfo.company && (
                      <span className="inline-flex items-center gap-1 text-[12px] text-slate-500">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {jobInfo.company}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
                      <Clock className="w-3 h-3" />
                      {fmtDate(app.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover note expand */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Cover Note
                      </p>
                      <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-xl px-4 py-3.5 ring-1 ring-slate-100">
                        {app.coverNote || (
                          <span className="italic text-slate-400">
                            No cover note provided.
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
