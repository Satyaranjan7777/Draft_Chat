import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, LogOut, Menu, MessageCircle, Settings, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import Button from "./Button";
import { useAuthStore } from "../store/useAuthStore";

const privateNavLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Chats", to: "/chat", icon: MessageCircle },
  { label: "Settings", to: "/settings", icon: Settings },
];
const publicNavLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Settings", to: "/settings", icon: Settings },
];

const getProfileUrl = (user) => user?.profilePicture?.url || user?.profilePic || "";
const getFirstName = (name = "") => name.trim().split(/\s+/)[0] || "User";

const NavBar = () => {
  const { authUser, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-primary/15 text-primary"
        : "hover:bg-base-200"
    }`;

  const authActions = authUser ? (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 rounded-full bg-base-100 px-2 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-base-300 transition hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={closeMenu}
      >
        <Avatar src={getProfileUrl(authUser)} name={authUser.fullName} size="sm" />
        <span className="max-w-28 truncate">{getFirstName(authUser.fullName)}</span>
      </Link>
      <Button variant="ghost" className="hidden px-3 lg:inline-flex" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <NavLink to="/login" className={linkClass}>
        Login
      </NavLink>
      <NavLink to="/register" className={linkClass}>
        Register
      </NavLink>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 text-base-content backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-black text-primary-content">
            C
          </span>
          <span className="text-lg font-bold">Draft Chat</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {(authUser ? privateNavLinks : publicNavLinks).map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <span className="inline-flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">{authActions}</div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-neutral/50 lg:hidden" onClick={closeMenu}>
          <aside
            className="ml-auto flex h-full w-full max-w-sm flex-col bg-base-100 text-base-content shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-base-300 px-4">
              <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-black text-primary-content">
                  C
                </span>
                <span className="text-lg font-bold">Draft Chat</span>
              </Link>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-lg hover:bg-base-200"
                onClick={closeMenu}
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-5">
              {authUser ? (
                <>
                  <Link
                    to="/profile"
                    className="mb-3 flex items-center gap-3 rounded-xl bg-base-200 p-3 ring-1 ring-base-300"
                    onClick={closeMenu}
                  >
                    <Avatar src={getProfileUrl(authUser)} name={authUser.fullName} size="md" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{authUser.fullName}</span>
                      <span className="block truncate text-xs opacity-60">{authUser.email}</span>
                    </span>
                  </Link>
                  {privateNavLinks.map(({ label, to, icon: Icon }) => (
                    <NavLink key={to} to={to} className={linkClass} onClick={closeMenu}>
                      <span className="inline-flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        {label}
                      </span>
                    </NavLink>
                  ))}
                  <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      Profile
                    </span>
                  </NavLink>
                  <Button variant="danger" className="mt-auto w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {publicNavLinks.map((item) => {
                    const IconComponent = item.icon;

                    return (
                      <NavLink key={item.to} to={item.to} className={linkClass} onClick={closeMenu}>
                        <span className="inline-flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                  <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={linkClass} onClick={closeMenu}>
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

export default NavBar;
