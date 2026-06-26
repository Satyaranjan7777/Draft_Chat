import { User } from "lucide-react";
import { useState } from "react";

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-28 w-28 text-3xl",
  xl: "h-36 w-36 text-4xl",
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar = ({ src, name, size = "md", className = "" }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name);
  const showImage = src && !imageFailed;

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} ${className} grid shrink-0 place-items-center overflow-hidden rounded-full border border-base-300 bg-primary font-semibold text-primary-content shadow-sm`}
      aria-label={name ? `${name}'s profile picture` : "Profile picture"}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name}'s profile picture` : "Profile picture"}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2" aria-hidden="true" />
      )}
    </div>
  );
};

export default Avatar;
