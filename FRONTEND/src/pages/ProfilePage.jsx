import { Camera, CheckCircle2, Mail, Trash2, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { useAuthStore } from "../store/useAuthStore";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

const getProfileUrl = (user) => user?.profilePicture?.url || user?.profilePic || "";

const formatMemberSince = (createdAt) => {
  if (!createdAt) return "Not available";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const ProfilePage = () => {
  const fileInputRef = useRef(null);
  const { authUser, updateProfile, removeProfilePicture, isUpdatingProfile } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      resetSelection();
      setError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > maxFileSize) {
      resetSelection();
      setError("Profile picture must be 5 MB or smaller.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || isUpdatingProfile) return;

    setError("");
    setSuccess("");
    try {
      await updateProfile(selectedFile);
      resetSelection();
      setSuccess("Profile picture updated successfully.");
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || "Unable to upload profile picture.");
    }
  };

  const handleRemove = async () => {
    if (!getProfileUrl(authUser) || isUpdatingProfile) return;
    const confirmed = window.confirm("Remove your current profile picture?");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await removeProfilePicture();
      resetSelection();
      setSuccess("Profile picture removed successfully.");
    } catch (removeError) {
      setError(removeError?.response?.data?.message || "Unable to remove profile picture.");
    }
  };

  const details = [
    { label: "Full Name", value: authUser?.fullName || "Not available", icon: UserRound },
    { label: "Email Address", value: authUser?.email || "Not available", icon: Mail },
    { label: "Member Since", value: formatMemberSince(authUser?.createdAt), icon: CheckCircle2 },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200 pb-12 text-base-content">
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="View your identity details and keep your chat profile photo current."
      />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <div className="rounded-2xl bg-base-100 p-6 text-center shadow-sm ring-1 ring-base-300">
          <div className="relative mx-auto h-36 w-36">
            <Avatar
              src={previewUrl || getProfileUrl(authUser)}
              name={authUser?.fullName}
              size="xl"
              className="h-36 w-36"
            />
            <button
              type="button"
              className="btn btn-primary btn-circle absolute bottom-2 right-2 shadow-lg ring-4 ring-base-100"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />

          <h2 className="mt-5 text-xl font-bold">{authUser?.fullName || "User"}</h2>
          <p className="mt-1 break-words text-sm opacity-60">{authUser?.email}</p>

          <div className="mt-6 flex flex-col gap-3">
            <Button variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-4 w-4" />
              Change Photo
            </Button>
            {selectedFile && (
              <div className="grid gap-3">
                <Button className="w-full" onClick={handleUpload} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <LoadingSpinner label="Uploading" /> : "Upload Photo"}
                </Button>
                <Button variant="ghost" className="w-full" onClick={resetSelection} disabled={isUpdatingProfile}>
                  Cancel
                </Button>
              </div>
            )}
            {getProfileUrl(authUser) && (
              <Button variant="danger" className="w-full" onClick={handleRemove} disabled={isUpdatingProfile}>
                <Trash2 className="h-4 w-4" />
                Remove Photo
              </Button>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 opacity-60">JPG, PNG, or WEBP. Maximum 5 MB.</p>
        </div>

        <div className="rounded-2xl bg-base-100 p-6 shadow-sm ring-1 ring-base-300 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Account details</h2>
            <p className="mt-1 text-sm opacity-70">These details come from your registered account.</p>
          </div>

          {error && (
            <div className="alert alert-error mb-5 text-sm" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-5 text-sm" role="status">
              {success}
            </div>
          )}

          <div className="grid gap-4">
            {details.map((detail) => {
              const IconComponent = detail.icon;

              return (
                <div key={detail.label} className="rounded-xl border border-base-300 bg-base-200 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-base-100 text-primary ring-1 ring-base-300">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{detail.label}</p>
                      <p className="mt-1 break-words text-base font-semibold">{detail.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
