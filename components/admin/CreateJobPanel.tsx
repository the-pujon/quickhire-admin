"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  DollarSign,
  FileText,
  Layers,
  Loader2,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { useCreateJobMutation } from "@/redux/api/jobBoardApi";
import type { CreateJobPayload } from "@/redux/api/jobBoardApi";
import { CATEGORIES, JOB_TYPES } from "@/lib/constants";
import FormField from "./FormField";
import FormSection from "./FormSection";

const INITIAL_FORM: CreateJobPayload = {
  title: "",
  company: "",
  location: "",
  category: "Technology",
  type: "Full-Time",
  description: "",
  requirements: [],
  salary: "",
};

const inputCls = (hasErr: boolean) =>
  [
    "w-full h-9 px-3 bg-white border rounded-lg text-[13px] text-slate-900",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all",
    hasErr
      ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400",
  ].join(" ");

const selectCls = [
  "w-full h-9 px-3 pr-8 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-900",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400",
  "transition-all appearance-none cursor-pointer",
].join(" ");

interface CreateJobPanelProps {
  onSuccess: () => void;
}

export default function CreateJobPanel({ onSuccess }: CreateJobPanelProps) {
  const [createJob, { isLoading }] = useCreateJobMutation();
  const [form, setForm] = useState<CreateJobPayload>({ ...INITIAL_FORM });
  const [reqInput, setReqInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CreateJobPayload>(
    k: K,
    v: CreateJobPayload[K],
  ) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k])
      setErrors((e) => {
        const c = { ...e };
        delete c[k];
        return c;
      });
  };

  const addReq = () => {
    const val = reqInput.trim();
    if (!val) return;
    setForm((f) => ({ ...f, requirements: [...f.requirements, val] }));
    setReqInput("");
  };

  const removeReq = (i: number) =>
    setForm((f) => ({
      ...f,
      requirements: f.requirements.filter((_, j) => j !== i),
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (form.description.trim().length < 20)
      e.description = "Description must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted errors");
      return;
    }
    try {
      await createJob(form).unwrap();
      toast.success("Job published successfully 🎉");
      setForm({ ...INITIAL_FORM });
      onSuccess();
    } catch {
      toast.error("Something went wrong — please try again");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/60">
        {/* Panel header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900 leading-tight">
              New Job Listing
            </h2>
            <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
              Fields marked <span className="text-red-500">*</span> are required
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Basic Info ───────────────────────────────────────── */}
          <FormSection icon={FileText} label="Basic Information">
            <FormField label="Job Title" required error={errors.title}>
              <input
                placeholder="e.g. Senior Frontend Engineer"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputCls(!!errors.title)}
                autoComplete="off"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Company" required error={errors.company}>
                <input
                  placeholder="e.g. Stripe, Inc."
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  className={inputCls(!!errors.company)}
                />
              </FormField>
              <FormField label="Location" required error={errors.location}>
                <input
                  placeholder="e.g. Remote / New York"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className={inputCls(!!errors.location)}
                />
              </FormField>
            </div>
          </FormSection>

          <hr className="border-slate-100" />

          {/* ── Classification ───────────────────────────────────── */}
          <FormSection icon={Tag} label="Classification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Category" required>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={selectCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
              <FormField label="Job Type" required>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                    className={selectCls}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
            </div>
            <FormField label="Salary Range" hint="Optional">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  placeholder="e.g. $90,000 – $130,000 / year"
                  value={form.salary ?? ""}
                  onChange={(e) => set("salary", e.target.value)}
                  className={`${inputCls(false)} pl-8`}
                />
              </div>
            </FormField>
          </FormSection>

          <hr className="border-slate-100" />

          {/* ── Role Details ─────────────────────────────────────── */}
          <FormSection icon={Layers} label="Role Details">
            <FormField
              label="Job Description"
              required
              error={errors.description}
            >
              <textarea
                placeholder="Describe the role, key responsibilities, team culture…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                className={[
                  "w-full px-3 py-2.5 bg-white border rounded-lg text-[13px] text-slate-900",
                  "placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none",
                  errors.description
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
                    : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400",
                ].join(" ")}
              />
              <p
                className={`text-[11px] mt-1 ${errors.description ? "text-red-500" : "text-slate-400"}`}
              >
                {errors.description ??
                  `${form.description.length} / min 20 characters`}
              </p>
            </FormField>

            <FormField label="Requirements" hint="Press Enter to add">
              <div className="flex gap-2">
                <input
                  placeholder="e.g. 3+ years of React experience"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addReq();
                    }
                  }}
                  className={inputCls(false)}
                />
                <button
                  type="button"
                  onClick={addReq}
                  className="px-3 h-9 bg-slate-100 hover:bg-slate-200 text-[13px] font-semibold text-slate-700 rounded-lg transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
              {form.requirements.length > 0 && (
                <ul className="mt-2.5 space-y-1.5">
                  {form.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 ring-1 ring-slate-100 group"
                    >
                      <div className="flex items-center gap-2 text-[13px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {req}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReq(i)}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-2 shrink-0"
                        aria-label="Remove requirement"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </FormField>
          </FormSection>

          {/* ── Footer ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 h-9 rounded-lg text-[13px] font-semibold transition-all hover:shadow-md hover:shadow-indigo-200/60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Publish Job
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ ...INITIAL_FORM });
                setErrors({});
              }}
              className="px-4 h-9 text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
