
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@/auth/firebaseAuth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;

    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(
        email.trim(),
        password
      );

      router.push("/");
    } catch (error: any) {
      console.error("Login failed:", error);

      setMessage(
        error?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        relative
        flex
        min-h-[100dvh]
        items-center
        justify-center
        overflow-hidden
        bg-[var(--background)]
        px-4
        py-8
        text-[var(--text-primary)]
      "
    >
      {/* =====================================================
          BACKGROUND — LIQUID LIGHT
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -top-40
          -left-32
          h-[420px]
          w-[420px]
          rounded-full
          bg-blue-500/[0.08]
          blur-[110px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-1/4
          h-[380px]
          w-[380px]
          rounded-full
          bg-purple-500/[0.07]
          blur-[110px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          left-1/3
          h-[420px]
          w-[420px]
          rounded-full
          bg-cyan-400/[0.035]
          blur-[120px]
        "
      />

      {/* =====================================================
          GLASS CARD
      ===================================================== */}

      <section
        className="
          liquid-glass-strong
          relative
          z-10
          w-full
          max-w-[430px]
          p-6
          sm:p-8
        "
      >
        {/* Top glass reflection */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-8
            top-0
            h-px
            bg-white/30
            blur-[1px]
          "
        />

        {/* =================================================
            LOGO / ICON
        ================================================= */}

        <div className="mb-7 flex justify-center">
          <div
            className="
              liquid-glass
              flex
              h-[72px]
              w-[72px]
              items-center
              justify-center
              rounded-[24px]
              text-3xl
              shadow-[0_15px_45px_rgba(0,0,0,0.25)]
            "
          >
            💧
          </div>
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="mb-7 text-center">
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-[var(--text-primary)]
            "
          >
            Welcome back
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-[var(--text-secondary)]
            "
          >
            Sign in to continue to Alwadi
          </p>
        </div>

        {/* =================================================
            EMAIL
        ================================================= */}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="
              mb-2
              block
              px-1
              text-sm
              font-medium
              text-[var(--text-secondary)]
            "
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (message) setMessage("");
            }}
            disabled={loading}
            className="
              glass-input
              w-full
              rounded-[20px]
              px-4
              py-3.5
              text-[15px]
              transition-all
              duration-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        {/* =================================================
            PASSWORD
        ================================================= */}

        <div className="mb-5">
          <label
            htmlFor="password"
            className="
              mb-2
              block
              px-1
              text-sm
              font-medium
              text-[var(--text-secondary)]
            "
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (message) setMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLogin();
              }
            }}
            disabled={loading}
            className="
              glass-input
              w-full
              rounded-[20px]
              px-4
              py-3.5
              text-[15px]
              transition-all
              duration-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {message && (
          <div
            className="
              mb-4
              rounded-[18px]
              border
              border-red-400/15
              bg-red-500/[0.07]
              px-4
              py-3
              text-center
              text-sm
              leading-5
              text-red-300
              backdrop-blur-xl
            "
          >
            {message}
          </div>
        )}

        {/* =================================================
            LOGIN BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="
            relative
            flex
            h-[54px]
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-[20px]
            bg-[var(--accent)]
            px-5
            font-bold
            text-[var(--accent-foreground)]
            shadow-[0_12px_35px_rgba(0,0,0,0.22)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_16px_42px_rgba(0,0,0,0.28)]
            active:scale-[0.985]
            disabled:cursor-not-allowed
            disabled:opacity-50
            disabled:hover:translate-y-0
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-white/60
            "
          />

          {loading ? (
            <span className="flex items-center gap-2">
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-current
                  border-t-transparent
                "
              />

              Signing in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        {/* =================================================
            REGISTER
        ================================================= */}

        <button
          type="button"
          onClick={() => router.push("/register")}
          disabled={loading}
          className="
            glass-button
            mt-3
            flex
            h-[54px]
            w-full
            items-center
            justify-center
            rounded-[20px]
            px-5
            font-semibold
            text-[var(--text-primary)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            active:scale-[0.985]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          إنشاء حساب جديد
          <span className="ml-2">✨</span>
        </button>

        {/* =================================================
            FOOTER
        ================================================= */}

        <p
          className="
            mt-6
            text-center
            text-xs
            leading-5
            text-[var(--text-muted)]
          "
        >
          Secure sign in · Alwadi
        </p>
      </section>
    </main>
  );
}
