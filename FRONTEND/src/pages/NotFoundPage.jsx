import { Home, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const NotFoundPage = () => {
  const { authUser } = useAuthStore();

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-base-200 px-4 text-base-content">
      <section className="w-full max-w-lg rounded-3xl bg-base-100 p-8 text-center shadow-xl ring-1 ring-base-300">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-4xl font-black">Page not found</h1>
        <p className="mt-4 opacity-65">The page you requested does not exist.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          {authUser && (
            <Link to="/chat" className="btn btn-outline">
              <MessageCircle className="h-5 w-5" />
              Open Chats
            </Link>
          )}
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
