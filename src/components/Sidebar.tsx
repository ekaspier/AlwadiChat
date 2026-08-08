"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuthConfig";

import { getFriends } from "@/lib/friends";
import { listenToAuth } from "@/lib/authListener";

import { useTheme } from "@/components/ThemeProvider";

export default function Sidebar({
  setSelectedUser,
}: {
  setSelectedUser: (user: any) => void;
}) {
  const router = useRouter();

  const { theme, setTheme } = useTheme();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToAuth((user: any) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    async function loadFriends() {
      try {
        const data = await getFriends(currentUser.uid);
        setFriends(data);
      } catch (error) {
        console.error("Failed to load friends:", error);
      }
    }

    loadFriends();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await signOut(auth);
      setMenuOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function navigate(path: string) {
    setMenuOpen(false);
    router.push(path);
  }

  function handleSelectFriend(friend: any) {
    setSelectedUser({
      id: friend.uid,
      name: friend.username,
      status: "Online",
    });

    setMenuOpen(false);
  }

  function changeTheme(newTheme: "dark" | "light") {
    setTheme(newTheme);
  }

  return (
    <aside className="relative h-full w-full overflow-hidden">
      {/* Ambient background */}

      <div
        className="
          pointer-events-none
          absolute
          -left-24
          -top-32
          h-72
          w-72
          rounded-full
          bg-blue-500/[0.08]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-1/2
          h-72
          w-72
          rounded-full
          bg-purple-500/[0.05]
          blur-3xl
        "
      />

      {/* Main content */}

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Header */}

        <header className="shrink-0 px-4 pb-3 pt-4 md:px-5 md:pt-6">
          <div
            className="
              liquid-glass
              flex
              items-center
              justify-between
              px-4
              py-3.5
            "
          >
            {/* Brand */}

            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-[var(--glass-border)]
                  bg-[var(--glass-bg-strong)]
                  text-lg
                "
              >
                💬
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-bold">
                  AlwadiChat
                </h1>

                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  دردش مع أصدقائك
                </p>
              </div>
            </div>

            {/* Menu button */}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
              className="
                glass-button
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                text-xl
                active:scale-90
              "
            >
              ☰
            </button>
          </div>
        </header>

        {/* Friends header */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            px-5
            pb-3
            pt-4
          "
        >
          <div>
            <h2 className="text-lg font-bold">الأصدقاء</h2>

            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {friends.length} أصدقاء
            </p>
          </div>

          <div
            className="
              liquid-glass
              flex
              h-8
              min-w-8
              items-center
              justify-center
              rounded-full
              px-2
              text-xs
              text-[var(--text-secondary)]
            "
          >
            {friends.length}
          </div>
        </div>

        {/* Friends */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            pb-6
            overscroll-contain
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {friends.length === 0 ? (
            <div
              className="
                liquid-glass
                mt-4
                p-7
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-[22px]
                  border
                  border-[var(--glass-border)]
                  bg-[var(--glass-bg-strong)]
                  text-3xl
                "
              >
                👥
              </div>

              <p className="font-semibold text-[var(--text-primary)]">
                لا يوجد أصدقاء بعد
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                ابحث عن أشخاص وأرسل لهم طلب صداقة
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend: any) => (
                <button
                  key={friend.uid}
                  type="button"
                  onClick={() => handleSelectFriend(friend)}
                  className="
                    glass-button
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-[22px]
                    p-3
                    text-right
                    active:scale-[0.985]
                  "
                >
                  {/* Avatar */}

                  <div
                    className="
                      relative
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      border
                      border-[var(--glass-border)]
                      bg-[var(--glass-bg-strong)]
                      text-base
                      font-bold
                    "
                  >
                    {friend.username
                      ? friend.username.charAt(0).toUpperCase()
                      : "?"}

                    <span
                      className="
                        absolute
                        bottom-0.5
                        right-0.5
                        h-3
                        w-3
                        rounded-full
                        border-2
                        border-[var(--background)]
                        bg-emerald-400
                      "
                    />
                  </div>

                  {/* User */}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {friend.username}
                    </p>

                    <p className="mt-1 text-[11px] text-emerald-500/80">
                      متصل الآن
                    </p>
                  </div>

                  <span
                    className="
                      px-1
                      text-lg
                      text-[var(--text-muted)]
                      transition-transform
                      duration-200
                      group-hover:-translate-x-1
                    "
                  >
                    ‹
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MENU OVERLAY
      ===================================================== */}

      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={() => setMenuOpen(false)}
        className={`
          absolute
          inset-0
          z-[90]
          bg-black/40
          backdrop-blur-[4px]
          transition-opacity
          duration-300

          ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          GLASS MENU
      ===================================================== */}

      <div
        className={`
          liquid-glass-strong
          absolute
          bottom-3
          right-3
          top-3
          z-[100]
          w-[min(330px,calc(100%-24px))]
          overflow-y-auto
          rounded-[32px]

          transition-all
          duration-300
          ease-out

          ${
            menuOpen
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-[110%] opacity-0"
          }
        `}
      >
        {/* Menu header */}

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-bold">القائمة</p>

            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              AlwadiChat
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="إغلاق القائمة"
            className="
              glass-button
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-lg
              active:scale-90
            "
          >
            ×
          </button>
        </div>

        {/* Menu content */}

        <div className="px-3 pb-5">
          {/* Profile */}

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="
              glass-button
              flex
              w-full
              items-center
              gap-3
              rounded-[22px]
              p-4
              text-right
              active:scale-[0.98]
            "
          >
            <span className="text-xl">👤</span>

            <div className="flex-1">
              <p className="font-semibold">الملف الشخصي</p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                حسابك ومعلوماتك
              </p>
            </div>

            <span className="text-[var(--text-muted)]">‹</span>
          </button>

          {/* Search + Requests */}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="
                glass-button
                rounded-[22px]
                p-4
                text-right
                active:scale-[0.98]
              "
            >
              <span className="text-xl">🔍</span>

              <p className="mt-2 font-semibold">بحث</p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                ابحث عن أصدقاء
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/requests")}
              className="
                glass-button
                rounded-[22px]
                p-4
                text-right
                active:scale-[0.98]
              "
            >
              <span className="text-xl">📩</span>

              <p className="mt-2 font-semibold">الطلبات</p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                طلبات الصداقة
              </p>
            </button>
          </div>

          {/* Appearance */}

          <div
            className="
              liquid-glass
              mt-2
              rounded-[22px]
              p-4
            "
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>

              <div className="flex-1">
                <p className="font-semibold">المظهر</p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  اختر شكل التطبيق
                </p>
              </div>
            </div>

            {/* Theme selector */}

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-1
                rounded-[18px]
                border
                border-[var(--glass-border)]
                bg-[var(--glass-bg)]
                p-1
              "
            >
              <button
                type="button"
                onClick={() => changeTheme("dark")}
                className={`
                  rounded-[14px]
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-300

                  ${
                    theme === "dark"
                      ? "bg-[#151515] text-white shadow-lg"
                      : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg-strong)]"
                  }
                `}
              >
                🌙 داكن
              </button>

              <button
                type="button"
                onClick={() => changeTheme("light")}
                className={`
                  rounded-[14px]
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-300

                  ${
                    theme === "light"
                      ? "bg-white text-black shadow-lg"
                      : "text-[var(--text-secondary)] hover:bg-[var(--glass-bg-strong)]"
                  }
                `}
              >
                ☀️ فاتح
              </button>
            </div>
          </div>

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              mt-2
              flex
              w-full
              items-center
              gap-3
              rounded-[22px]
              border
              border-red-500/10
              bg-red-500/[0.07]
              p-4
              text-right
              transition
              hover:bg-red-500/[0.12]
              active:scale-[0.98]
            "
          >
            <span className="text-xl">🚪</span>

            <div className="flex-1">
              <p className="font-semibold text-red-500">
                تسجيل الخروج
              </p>

              <p className="mt-1 text-xs text-red-500/50">
                الخروج من الحساب
              </p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}