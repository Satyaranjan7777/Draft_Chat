import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, MessagesSquare, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthStore } from "../store/useAuthStore";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn, isLogingIn } = useAuthStore();
  const isSubmitting = isLoggingIn || isLogingIn;
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    const nextErrors = {};
    const email = formData.email.trim();

    if (!email) nextErrors.email = "Email is required";
    else if (!emailPattern.test(email)) nextErrors.email = "Enter a valid email address";
    if (!formData.password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    setApiError("");
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate(location.state?.from?.pathname || "/chat", { replace: true });
    } catch (error) {
      setApiError(error?.response?.data?.message || "Unable to login. Please check your details.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200 text-base-content">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="order-2 overflow-hidden rounded-2xl bg-neutral text-neutral-content shadow-2xl lg:order-1">
          <div className="relative min-h-[520px] p-8 sm:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-neutral to-secondary/50" />
            <div className="relative flex h-full flex-col justify-between gap-12">
              <div>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-neutral-content/10 px-4 py-2 text-sm font-semibold ring-1 ring-neutral-content/15">
                  <MessageCircle className="h-4 w-4" />
                  Real-time messaging
                </div>
                <h1 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                  Welcome back to Draft Chat
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 opacity-80">
                  Sign in to continue your conversations, see who is online, and share messages instantly.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: MessagesSquare, label: "Chats" },
                  { icon: UsersRound, label: "Contacts" },
                  { icon: ShieldCheck, label: "Private" },
                ].map((item) => {
                  const IconComponent = item.icon;

                  return (
                    <div key={item.label} className="rounded-xl bg-neutral-content/10 p-4 ring-1 ring-neutral-content/15">
                      <IconComponent className="mb-4 h-6 w-6 text-primary" />
                      <p className="text-sm font-semibold">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 rounded-2xl bg-base-100 p-6 shadow-xl ring-1 ring-base-300 sm:p-8 lg:order-2">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Sign in</p>
            <h2 className="mt-2 text-3xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 opacity-70">
              Sign in to continue your conversations.
            </p>
          </div>

          {apiError && (
            <div className="alert alert-error mb-5 text-sm" role="alert">
              {apiError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="input input-bordered mt-2 w-full bg-base-100"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="mt-2 text-sm text-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="input input-bordered w-full bg-base-100 pr-12"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
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
              {errors.password && <p id="password-error" className="mt-2 text-sm text-error">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner label="Signing in" /> : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm opacity-70">
            New to Draft Chat?{" "}
            <Link to="/register" className="link link-primary font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
