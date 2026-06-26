import {
  ArrowRight,
  LogIn,
  LogOut,
  MessageCircle,
  MessagesSquare,
  Settings,
  ShieldCheck,
  UserPlus,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const features = [
  {
    icon: Zap,
    title: "Real-time conversations",
    description: "Send messages instantly and keep every conversation moving.",
  },
  {
    icon: UsersRound,
    title: "See who is online",
    description: "Find registered users and know when your contacts are available.",
  },
  {
    icon: ShieldCheck,
    title: "Your account, protected",
    description: "Private chat and profile pages stay behind secure authentication.",
  },
];

const LandingPage = () => {
  const { authUser, logout } = useAuthStore();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200 text-base-content">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <MessageCircle className="h-4 w-4" />
            Welcome to Draft Chat
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] sm:text-6xl">
            Connect instantly.
            <span className="mt-2 block text-primary">Keep every conversation close.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 opacity-70">
            Chat securely with registered users in real time. See who is online, share messages,
            and make the app feel like yours with customizable themes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {authUser ? (
              <>
                <Link to="/chat" className="btn btn-primary">
                  <MessagesSquare className="h-5 w-5" />
                  Open Chats
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/profile" className="btn btn-outline">
                  <UserRound className="h-5 w-5" />
                  Profile
                </Link>
                <Link to="/settings" className="btn btn-ghost">
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button type="button" className="btn btn-ghost text-error" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  <LogIn className="h-5 w-5" />
                  Login to Chat
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/register" className="btn btn-outline">
                  <UserPlus className="h-5 w-5" />
                  Register
                </Link>
                <Link to="/settings" className="btn btn-ghost">
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl bg-neutral p-6 text-neutral-content shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-content/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-content">
                  <MessagesSquare className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold">Draft Chat</p>
                  <p className="text-sm opacity-60">Live conversations</p>
                </div>
              </div>
              <span className="badge badge-success gap-2">
                <span className="h-2 w-2 rounded-full bg-success-content" />
                Online
              </span>
            </div>

            <div className="space-y-4 py-8">
              <div className="chat chat-start">
                <div className="chat-bubble bg-neutral-content/10 text-neutral-content">
                  Hey! Ready to catch up?
                </div>
              </div>
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-primary">
                  Absolutely. Messages arrive instantly here.
                </div>
              </div>
              <div className="chat chat-start">
                <div className="chat-bubble bg-neutral-content/10 text-neutral-content">
                  Perfect — see you in the chat.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-neutral-content/10 p-3 ring-1 ring-neutral-content/10">
              <span className="flex-1 text-sm opacity-50">Type a message...</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-content">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-base-300 bg-base-100">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;

            return (
              <article key={feature.title} className="rounded-2xl bg-base-200 p-6 ring-1 ring-base-300">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <IconComponent className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-lg font-bold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 opacity-65">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
