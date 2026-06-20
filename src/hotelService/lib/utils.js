import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i) => twMerge(clsx(i));

export const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const formatTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export const formatDuration = (min) => {
  if (!min) return "—";
  return min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`;
};

export const statusBadge = (s) => ({
  pending:   "badge-pending",
  accepted:  "badge-accepted",
  completed: "badge-completed",
}[s] || "badge-pending");

export const statusLabel = (s) => ({
  pending:   "Pending",
  accepted:  "Accepted",
  completed: "Completed",
}[s] || s);
