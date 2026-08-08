
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/auth/firebaseAuth";
import { createUserProfile } from "@/lib/users";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (loading) return;

    setMessage("");
    setSuccess(false);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail || !password.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (cleanUsername.length < 3) {
      setMessage("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await registerUser(
        cleanEmail,
        password
      );

      const user = userCredential.user;

      await createUserProfile(
        user.uid,
        cleanUsername,
        cleanEmail
      );

      setSuccess(true);
      setMessage("تم إنشاء الحساب بنجاح ✅");

      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (error: any) {
      console.error("Registration failed:", error);

      setSuccess(false);

      setMessage(
        error?.message ||
          "Registration failed. Please try again."
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
          LIQUID BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-40
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
        {/* Top reflection */}

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
            ICON
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
            ✨
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
            Create Account
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-[var(--text-secondary)]
            "
          >
            Create your Alwadi account
          </p>
        </div>

        {/* =================================================
            USERNAME
        ================================================= */}

        <div className="mb-4">
          <label
            htmlFor="username"
            className="
              mb-2
              block
              px-1
              text-sm
              font-medium
              text-[var(--text-secondary)]
            "
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (message && !success) {
                setMessage("");
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
            EMAIL
        ================================================= */}

        <div className="mb-4">
          <label
            htmlFor="register-email"
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
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (message && !success) {
                setMessage("");
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
            PASSWORD
        ================================================= */}

        <div className="mb-5">
          <label
            htmlFor="register-password"
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
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (message && !success) {
                setMessage("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRegister();
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
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`
              mb-4
              rounded-[18px]
              border
              px-4
              py-3
              text-center
              text-sm
              leading-5
              backdrop-blur-xl

              ${
                success
                  ? `
                    border-emerald-400/15
                    bg-emerald-500/[0.07]
                    text-emerald-300
                  `
                  : `
                    border-red-400/15
                    bg-red-500/[0.07]
                    text-red-300
                  `
              }
            `}
          >
            {message}
          </div>
        )}

        {/* =================================================
            REGISTER BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleRegister}
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

              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        <button
          type="button"
          onClick={() => router.push("/login")}
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
          Already have an account?
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
          Secure account creation · Alwadi
        </p>
      </section>
    </main>
  );
}
