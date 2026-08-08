
"use client";

import { useEffect, useState } from "react";

import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/friendRequests";

import { listenToAuth } from "@/lib/authListener";

export default function RequestsPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // =========================================================
  // AUTH
  // =========================================================

  useEffect(() => {
    const unsubscribe = listenToAuth((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // =========================================================
  // LOAD REQUESTS
  // =========================================================

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadRequests() {
      try {
        setLoading(true);

        const data = await getFriendRequests(user.uid);

        setRequests(data);
      } catch (error) {
        console.error("Failed to load friend requests:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [user]);

  // =========================================================
  // ACCEPT
  // =========================================================

  async function accept(id: string) {
    if (processingId) return;

    try {
      setProcessingId(id);

      await acceptFriendRequest(id);

      setRequests((current) =>
        current.filter((request) => request.id !== id)
      );
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    } finally {
      setProcessingId(null);
    }
  }

  // =========================================================
  // REJECT
  // =========================================================

  async function reject(id: string) {
    if (processingId) return;

    try {
      setProcessingId(id);

      await rejectFriendRequest(id);

      setRequests((current) =>
        current.filter((request) => request.id !== id)
      );
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    } finally {
      setProcessingId(null);
    }
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main
      className="
        relative
        min-h-[100dvh]
        overflow-hidden
        bg-[var(--background)]
        px-4
        py-6
        text-[var(--text-primary)]
        sm:px-6
        sm:py-10
      "
    >
      {/* =====================================================
          LIQUID BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          -top-40
          h-[440px]
          w-[440px]
          rounded-full
          bg-blue-500/[0.075]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/4
          h-[420px]
          w-[420px]
          rounded-full
          bg-purple-500/[0.065]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          left-1/3
          h-[400px]
          w-[400px]
          rounded-full
          bg-cyan-400/[0.035]
          blur-[120px]
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-2xl
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            liquid-glass
            mb-5
            flex
            items-center
            gap-4
            px-5
            py-4
            sm:px-6
          "
        >
          {/* Icon */}

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-[18px]
              border
              border-[var(--glass-border)]
              bg-[var(--glass-bg-strong)]
              text-xl
              shadow-[inset_0_1px_0_var(--glass-highlight)]
            "
          >
            🤝
          </div>

          {/* Title */}

          <div className="min-w-0 flex-1">
            <h1
              className="
                truncate
                text-xl
                font-bold
                tracking-tight
                sm:text-2xl
              "
            >
              طلبات الصداقة
            </h1>

            <p
              className="
                mt-0.5
                text-sm
                text-[var(--text-secondary)]
              "
            >
              {requests.length > 0
                ? `${requests.length} طلب بانتظارك`
                : "إدارة طلبات الصداقة"}
            </p>
          </div>

          {/* Counter */}

          {requests.length > 0 && (
            <div
              className="
                flex
                h-9
                min-w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/[0.08]
                px-2.5
                text-sm
                font-bold
                shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
              "
            >
              {requests.length}
            </div>
          )}
        </header>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div
            className="
              liquid-glass
              flex
              min-h-[180px]
              items-center
              justify-center
              px-6
              py-8
            "
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-white/15
                  border-t-white/80
                "
              />

              <p
                className="
                  text-sm
                  text-[var(--text-secondary)]
                "
              >
                جاري تحميل الطلبات...
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!loading && requests.length === 0 && (
          <div
            className="
              liquid-glass-strong
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              px-6
              py-10
              text-center
            "
          >
            <div
              className="
                mb-5
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-[26px]
                border
                border-[var(--glass-border)]
                bg-[var(--glass-bg-strong)]
                text-4xl
                shadow-[inset_0_1px_0_var(--glass-highlight)]
              "
            >
              👋
            </div>

            <h2
              className="
                text-xl
                font-bold
              "
            >
              لا يوجد طلبات حالياً
            </h2>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-[var(--text-secondary)]
              "
            >
              عندما يرسل لك أحد طلب صداقة، سيظهر هنا
              لتتمكن من قبوله أو رفضه.
            </p>
          </div>
        )}

        {/* ===================================================
            REQUESTS
        =================================================== */}

        {!loading && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((req: any) => {
              const isProcessing =
                processingId === req.id;

              return (
                <article
                  key={req.id}
                  className="
                    liquid-glass
                    group
                    relative
                    overflow-hidden
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-[var(--glass-border)]
                    sm:p-5
                  "
                >
                  {/* Top reflection */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      h-px
                      bg-white/20
                    "
                  />

                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    {/* USER */}

                    <div className="flex min-w-0 items-center gap-3">
                      {/* Avatar */}

                      <div
                        className="
                          relative
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-full
                          border
                          border-[var(--glass-border)]
                          bg-[var(--glass-bg-strong)]
                          text-lg
                          font-bold
                          shadow-[inset_0_1px_0_var(--glass-highlight)]
                        "
                      >
                        {(
                          req.sender?.username ||
                          "مستخدم"
                        )[0]?.toUpperCase() || "U"}

                        <span
                          className="
                            absolute
                            bottom-0.5
                            right-0.5
                            h-3.5
                            w-3.5
                            rounded-full
                            border-2
                            border-[var(--background)]
                            bg-emerald-400
                            shadow-[0_0_10px_rgba(52,211,153,0.55)]
                          "
                        />
                      </div>

                      {/* INFO */}

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-base
                            font-bold
                            sm:text-lg
                          "
                        >
                          {req.sender?.username ||
                            "مستخدم"}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-sm
                            text-[var(--text-secondary)]
                          "
                        >
                          يريد إضافتك كصديق
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        w-full
                        gap-2
                        sm:w-auto
                      "
                    >
                      {/* ACCEPT */}

                      <button
                        type="button"
                        onClick={() =>
                          accept(req.id)
                        }
                        disabled={
                          processingId !== null
                        }
                        className="
                          flex
                          h-11
                          flex-1
                          items-center
                          justify-center
                          rounded-[16px]
                          bg-[var(--accent)]
                          px-5
                          font-bold
                          text-[var(--accent-foreground)]
                          shadow-[0_8px_25px_rgba(0,0,0,0.16)]
                          transition-all
                          duration-200
                          hover:-translate-y-0.5
                          hover:shadow-[0_12px_30px_rgba(0,0,0,0.22)]
                          active:scale-[0.97]
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          sm:flex-none
                        "
                      >
                        {isProcessing ? (
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
                        ) : (
                          "قبول"
                        )}
                      </button>

                      {/* REJECT */}

                      <button
                        type="button"
                        onClick={() =>
                          reject(req.id)
                        }
                        disabled={
                          processingId !== null
                        }
                        className="
                          glass-button
                          flex
                          h-11
                          flex-1
                          items-center
                          justify-center
                          rounded-[16px]
                          px-5
                          font-semibold
                          text-[var(--text-primary)]
                          transition-all
                          duration-200
                          hover:-translate-y-0.5
                          active:scale-[0.97]
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          sm:flex-none
                        "
                      >
                        {isProcessing ? "..." : "رفض"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
