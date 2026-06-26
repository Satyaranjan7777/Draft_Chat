import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    const nextErrors = {};
    const email = formData.email.trim();

    if (!formData.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!email) nextErrors.email = "Email is required";
    else if (!emailPattern.test(email)) nextErrors.email = "Enter a valid email address";
    if (!formData.password) nextErrors.password = "Password is required";
    else if (formData.password.length < 6) nextErrors.password = "Password must be at least 6 characters";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSigningUp || !validateForm()) return;

    try {
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate("/chat", { replace: true });
    } catch {
      // The auth store shows the API error toast.
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200 text-base-content">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-base-100 shadow-xl ring-1 ring-base-300 lg:grid-cols-[0.85fr_1fr]">
          <div className="bg-neutral p-8 text-neutral-content sm:p-10">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-content">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="mt-8 text-3xl font-black leading-tight sm:text-4xl">Create your Draft Chat account</h1>
            <p className="mt-4 text-sm leading-6 opacity-75">
              Start conversations, manage your profile, and see your contacts in real time.
            </p>
          </div>

          <form className="space-y-5 p-6 sm:p-8" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                className="input input-bordered mt-2 w-full bg-base-100"
                placeholder="Your name"
                value={formData.fullName}
                onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
              />
              {errors.fullName && <p className="mt-2 text-sm text-error">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="registerEmail" className="block text-sm font-semibold">
                Email
              </label>
              <input
                id="registerEmail"
                type="email"
                autoComplete="email"
                className="input input-bordered mt-2 w-full bg-base-100"
                placeholder="dev@test.in"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              />
              {errors.email && <p className="mt-2 text-sm text-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="registerPassword" className="block text-sm font-semibold">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="input input-bordered w-full bg-base-100 pr-12"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-square btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-error">{errors.password}</p>}
            </div>

            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account
                </>
              ) : (
                "Register"
              )}
            </button>

            <p className="text-center text-sm opacity-70">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
