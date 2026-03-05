export const CATEGORIES = [
  "Technology",
  "Marketing",
  "Design",
  "Business",
  "Finance",
  "Human Resource",
  "Engineering",
  "Sales",
] as const;

export const JOB_TYPES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Internship",
  "Remote",
] as const;

export const TYPE_STYLES: Record<string, string> = {
  "Full-Time": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  "Part-Time": "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  Contract: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  Internship: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Remote: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100",
};

export const CATEGORY_STYLES: Record<string, string> = {
  Technology: "bg-indigo-50 text-indigo-700",
  Marketing: "bg-pink-50 text-pink-700",
  Design: "bg-rose-50 text-rose-700",
  Business: "bg-orange-50 text-orange-700",
  Finance: "bg-green-50 text-green-700",
  "Human Resource": "bg-sky-50 text-sky-700",
  Engineering: "bg-purple-50 text-purple-700",
  Sales: "bg-teal-50 text-teal-700",
};

export const NAV_ITEMS = [
  { key: "jobs", label: "Job Listings", href: "/jobs" },
  { key: "applications", label: "Applications", href: "/applications" },
  { key: "create", label: "Post New Job", href: "/create" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];
