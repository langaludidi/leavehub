import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useQuery } from "@tanstack/react-query";

type Me = { id: string; email?: string | null; full_name?: string | null };

function initials(nameOrEmail?: string | null) {
  if (!nameOrEmail) return "U";
  const n = nameOrEmail.trim();
  if (!n.includes(" ")) {
    // from email or single word
    return n.slice(0, 1).toUpperCase();
  }
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "U";
}

async function fetchMe(): Promise<Me | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  // try profiles table first (full_name), fallback to auth email
  const { data: p } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: p?.email ?? user.email,
    full_name: p?.full_name ?? null
  };
}

export default function UserMenu() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const q = useQuery({ queryKey: ["me-basic"], queryFn: fetchMe });

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (!open) return;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const display = q.data?.full_name || q.data?.email || "User";
  const tag = q.data?.email ? q.data.email : "";

  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/sign-in", { replace: true });
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
          {initials(q.data?.full_name || q.data?.email)}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">{display}</span>
          {tag && <span className="text-[11px] text-gray-500 leading-none">{tag}</span>}
        </div>
        <svg
          className="h-4 w-4 text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.936a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-50"
        >
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="text-sm font-medium truncate">{display}</div>
            {tag && <div className="text-xs text-gray-500 truncate">{tag}</div>}
          </div>
          <div className="py-1">
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => { nav("/profile"); setOpen(false); }}
            >
              👤 Profile
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => { nav("/settings"); setOpen(false); }}
            >
              ⚙️ Settings
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800" />
          <button
            className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
