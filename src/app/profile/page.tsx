"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listenToAuth } from "@/lib/authListener";
import { getUserProfile } from "@/lib/users";

type ThemeMode = "dark" | "light";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<ThemeMode>("dark");

  /* Load saved theme */
  useEffect(() => {
    const savedTheme = localStorage.getItem("alwadi-theme");

    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  /* Apply theme */
  function changeTheme(newTheme: ThemeMode) {
    setTheme(newTheme);

    if (newTheme === "light") {
      document.documentElement.classList.add("light");
      localStorage.setItem("alwadi-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("alwadi-theme", "dark");
    }
  }

  /* Load profile */
  useEffect(() => {
    const unsubscribe = listenToAuth(async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getUserProfile(user.uid);

        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  /* Loading */
  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="liquid-glass px-8 py-5">
          <p className="text-[var(--text-secondary)]">
            جاري التحميل...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        min-h-[100dvh]
        bg-[var(--background)]
        text-[var(--text-primary)]
        flex
        items-center
        justify-center
        p-4
        sm:p-6
        transition-colors
        duration-300
      "
    >
      <div
        className="
          liquid-glass-strong
          w-full
          max-w-md
          p-6
          sm:p-8
          text-center
        "
      >
        {/* Back */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => router.push("/")}
            className="
              glass-button
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              text-xl
              text-[var(--text-secondary)]
            "
            aria-label="العودة"
          >
            →
          </button>
        </div>

        {/* Avatar */}
        <div
          className="
            liquid-glass
            w-28
            h-28
            mx-auto
            rounded-full
            flex
            items-center
            justify-center
            text-5xl
            font-bold
            text-[var(--text-primary)]
          "
        >
          {profile?.username?.[0]?.toUpperCase() || "U"}
        </div>

        {/* Username */}
        <h1 className="text-3xl font-bold mt-6">
          {profile?.username || "User"}
        </h1>

        {/* Email */}
        <p className="text-[var(--text-secondary)] mt-2 break-all">
          {profile?.email}
        </p>

        {/* Divider */}
        <div className="h-px bg-[var(--glass-border)] my-7" />

        {/* Appearance */}
        <div className="text-right">
          <h2 className="font-bold text-lg">
            المظهر
          </h2>

          <p className="text-sm text-[var(--text-secondary)] mt-1">
            اختر مظهر التطبيق
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Dark */}
            <button
              onClick={() => changeTheme("dark")}
              className={`
                glass-button
                rounded-2xl
                p-4
                text-center
                ${
                  theme === "dark"
                    ? "ring-2 ring-white/30"
                    : ""
                }
              `}
            >
              <div className="text-2xl mb-2">
                🌙
              </div>

              <p className="font-bold">
                داكن
              </p>

              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Dark
              </p>
            </button>

            {/* Light */}
            <button
              onClick={() => changeTheme("light")}
              className={`
                glass-button
                rounded-2xl
                p-4
                text-center
                ${
                  theme === "light"
                    ? "ring-2 ring-black/20"
                    : ""
                }
              `}
            >
              <div className="text-2xl mb-2">
                ☀️
              </div>

              <p className="font-bold">
                فاتح
              </p>

              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Light
              </p>
            </button>
          </div>
        </div>

        {/* Back to chat */}
        <button
          onClick={() => router.push("/")}
          className="
            glass-button
            w-full
            mt-7
            py-4
            rounded-2xl
            font-bold
            text-[var(--text-primary)]
          "
        >
          العودة للشات 💬
        </button>
      </div>
    </main>
  );
}