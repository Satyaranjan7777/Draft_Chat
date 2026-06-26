import { Check, MessageCircle, RotateCcw, Search, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import { DAISY_THEMES, formatThemeName } from "../lib/themes";
import { useAuthStore } from "../store/useAuthStore";
import { DEFAULT_THEME, useThemeStore } from "../store/useThemeStore";

const ThemeCard = ({ name, selected, onSelect }) => (
  <button
    type="button"
    data-theme={name}
    onClick={() => onSelect(name)}
    aria-pressed={selected}
    className={`card relative w-full overflow-hidden border bg-base-100 text-left text-base-content shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
      selected ? "border-primary ring-2 ring-primary" : "border-base-300"
    }`}
  >
    <span className="grid grid-cols-[1fr_auto] gap-3 bg-base-200 p-4">
      <span>
        <span className="block text-sm font-bold">{formatThemeName(name)}</span>
        <span className="mt-1 block text-xs opacity-60">DaisyUI theme</span>
      </span>
      {selected && (
        <span className="badge badge-primary gap-1">
          <Check className="h-3 w-3" />
          Active
        </span>
      )}
    </span>
    <span className="flex items-center gap-2 p-4">
      <span className="h-8 flex-1 rounded-md border border-base-300 bg-base-100" title="Base color" />
      <span className="h-8 w-8 rounded-full bg-primary" title="Primary color" />
      <span className="h-8 w-8 rounded-full bg-secondary" title="Secondary color" />
      <span className="h-8 w-8 rounded-full bg-accent" title="Accent color" />
    </span>
  </button>
);

const ThemePreview = ({ theme }) => (
  <div data-theme={theme} className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-xl">
    <div className="grid min-h-[470px] md:grid-cols-[210px_1fr]">
      <aside className="hidden border-r border-base-300 bg-base-200 p-3 md:block">
        <div className="mb-3 flex items-center gap-2 px-2 py-1">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-bold">Chats</span>
        </div>
        <label className="input input-bordered input-sm flex w-full items-center gap-2 bg-base-100">
          <Search className="h-4 w-4 opacity-60" />
          <span className="text-xs opacity-60">Search users</span>
        </label>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 rounded-box bg-primary/15 p-2">
            <Avatar name="Aarav Mehta" size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold">Aarav Mehta</span>
              <span className="block text-[11px] text-success">Online</span>
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-box p-2">
            <Avatar name="Maya Sharma" size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold">Maya Sharma</span>
              <span className="block text-[11px] opacity-55">Offline</span>
            </span>
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col bg-base-200">
        <header className="flex items-center gap-3 border-b border-base-300 bg-base-100 p-4">
          <div className="indicator">
            <span className="indicator-item badge badge-success badge-xs" aria-label="Online" />
            <Avatar name="Aarav Mehta" size="sm" />
          </div>
          <div>
            <p className="text-sm font-bold">Aarav Mehta</p>
            <p className="text-xs text-success">Online</p>
          </div>
          <span className="badge badge-outline ml-auto">Preview</span>
        </header>

        <div className="flex-1 space-y-2 overflow-hidden p-4 sm:p-6">
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <Avatar name="Aarav Mehta" size="sm" />
            </div>
            <div className="chat-header text-xs">
              Aarav <time className="opacity-50">10:30</time>
            </div>
            <div className="chat-bubble">Hi! Have you checked the new chat theme?</div>
          </div>
          <div className="chat chat-end">
            <div className="chat-image avatar">
              <Avatar name="You" size="sm" />
            </div>
            <div className="chat-header text-xs">
              You <time className="opacity-50">10:31</time>
            </div>
            <div className="chat-bubble chat-bubble-primary">Yes, it looks much better now.</div>
          </div>
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <Avatar name="Aarav Mehta" size="sm" />
            </div>
            <div className="chat-bubble">Great! Your selected theme applies across the whole app.</div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-base-300 bg-base-100 p-3">
          <input className="input input-bordered min-w-0 flex-1" placeholder="Type a message" disabled />
          <button type="button" className="btn btn-primary btn-square" aria-label="Preview send button" disabled>
            <Send className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  </div>
);

const SettingPage = () => {
  const { authUser } = useAuthStore();
  const { theme, setTheme, resetTheme } = useThemeStore();
  const [query, setQuery] = useState("");

  const filteredThemes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return DAISY_THEMES;
    return DAISY_THEMES.filter((name) => name.toLowerCase().includes(normalizedQuery));
  }, [query]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-base-200 pb-14 text-base-content">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" />
              Appearance settings
            </div>
            <h1 className="text-3xl font-black sm:text-4xl">Choose your chat theme</h1>
            <p className="mt-3 max-w-2xl opacity-70">
              Pick a DaisyUI theme and the whole application changes instantly. Your choice stays on this browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary badge-lg">Current: {formatThemeName(theme)}</span>
            <Link to={authUser ? "/chat" : "/login"} className="btn btn-ghost btn-sm">
              {authUser ? "Back to chats" : "Back to login"}
            </Link>
          </div>
        </div>

        <section className="mt-10" aria-labelledby="theme-list-heading">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="theme-list-heading" className="text-xl font-bold">Themes</h2>
              <p className="mt-1 text-sm opacity-65">Select any card to apply it across the app.</p>
            </div>
            <div className="flex gap-2">
              <label className="input input-bordered flex items-center gap-2 bg-base-100">
                <Search className="h-4 w-4 opacity-60" />
                <span className="sr-only">Search themes</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search themes"
                  className="min-w-0"
                />
              </label>
              <button type="button" className="btn btn-outline" onClick={resetTheme} disabled={theme === DEFAULT_THEME}>
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {filteredThemes.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredThemes.map((name) => (
                <ThemeCard key={name} name={name} selected={theme === name} onSelect={setTheme} />
              ))}
            </div>
          ) : (
            <div className="alert bg-base-100">
              <Search className="h-5 w-5" />
              <span>No themes found for “{query.trim()}”.</span>
            </div>
          )}
        </section>

        <section className="mt-12" aria-labelledby="preview-heading">
          <div className="mb-5">
            <h2 id="preview-heading" className="text-xl font-bold">Theme Preview</h2>
            <p className="mt-1 text-sm opacity-65">A visual demo only—nothing here sends a real message.</p>
          </div>
          <ThemePreview theme={theme} />
        </section>
      </section>
    </main>
  );
};

export default SettingPage;
