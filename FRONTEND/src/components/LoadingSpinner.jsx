import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ label = "Loading", className = "" }) => (
  <span className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    <span>{label}</span>
  </span>
);

export default LoadingSpinner;
