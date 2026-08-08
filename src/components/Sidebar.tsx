"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuthConfig";

import { getFriends } from "@/lib/friends";
import { listenToAuth } from "@/lib/authListener";

import { clearAllChats } from "@/lib/firebaseFirestore";

import { useTheme } from "@/components/ThemeProvider";

// =========================================================
// TYPES
// =========================================================

type SidebarProps = {
  setSelectedUser: (user: {
    id: string;
    name: string;
    status: string;
  }) => void;
};

// =========================================================
// SIDEBAR
// =========================================================

export default function Sidebar({
  setSelectedUser,
}: SidebarProps) {
  const router = useRouter();

  const {
    theme,
    setTheme,
  } = useTheme();

  const [
    currentUser,
    setCurrentUser,
  ] = useState<any>(null);

  const [
    friends,
    setFriends,
  ] = useState<any[]>([]);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  // =======================================================
  // DELETE ALL CHATS
  // =======================================================

  const [
    showDeleteAllConfirm,
    setShowDeleteAllConfirm,
  ] = useState(false);

  const [
    deletingAllChats,
    setDeletingAllChats,
  ] = useState(false);

  // =======================================================
  // AUTH
  // =======================================================

  useEffect(() => {
    const unsubscribe =
      listenToAuth(
        (user: any) => {
          setCurrentUser(user);
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  // =======================================================
  // LOAD FRIENDS
  // =======================================================

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function loadFriends() {
      try {
        const data =
          await getFriends(
            currentUser.uid
          );

        setFriends(data);
      } catch (error) {
        console.error(
          "Failed to load friends:",
          error
        );
      }
    }

    loadFriends();
  }, [currentUser]);

  // =======================================================
  // LOGOUT
  // =======================================================

  async function handleLogout() {
    try {
      setMenuOpen(false);

      await signOut(auth);

      router.push("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  // =======================================================
  // NAVIGATION
  // =======================================================

  function navigate(path: string) {
    setMenuOpen(false);
    router.push(path);
  }

  // =======================================================
  // SELECT FRIEND
  // =======================================================

  function handleSelectFriend(
    friend: any
  ) {
    setSelectedUser({
      id: friend.uid,
      name: friend.username,
      status: "Online",
    });

    setMenuOpen(false);
  }

  // =======================================================
  // THEME
  // =======================================================

  function changeTheme(
    newTheme: "dark" | "light"
  ) {
    setTheme(newTheme);
  }

  // =======================================================
  // ASK DELETE ALL
  // =======================================================

  function askDeleteAllChats() {
    if (
      !currentUser ||
      deletingAllChats
    ) {
      return;
    }

    setMenuOpen(false);
    setShowDeleteAllConfirm(true);
  }

  // =======================================================
  // CONFIRM DELETE ALL
  // =======================================================

  async function confirmDeleteAllChats() {
    if (
      !currentUser ||
      deletingAllChats
    ) {
      return;
    }

    try {
      setDeletingAllChats(true);

      const friendUids =
        friends
          .map(
            (friend: any) =>
              friend.uid
          )
          .filter(Boolean);

      await clearAllChats(
        currentUser.uid,
        friendUids
      );

      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error(
        "Failed to delete all chats:",
        error
      );

      alert(
        "فشل حذف جميع المحادثات"
      );
    } finally {
      setDeletingAllChats(false);
    }
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <>
      {/* =================================================
          AMBIENT BACKGROUND
      ================================================= */}

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

      {/* =================================================
          MAIN
      ================================================= */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          min-h-0
          flex-col
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            shrink-0
            px-4
            pb-3
            pt-4
            md:px-5
            md:pt-6
          "
        >
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
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
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
                <h1
                  className="
                    truncate
                    text-base
                    font-bold
                  "
                >
                  AlwadiChat
                </h1>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    text-[var(--text-muted)]
                  "
                >
                  دردش مع أصدقائك
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
              className="
                glass-button
                flex
                h-11
                w-11
                shrink-0
                cursor-pointer
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

        {/* =================================================
            FRIENDS TITLE
        ================================================= */}

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
            <h2
              className="
                text-lg
                font-bold
              "
            >
              الأصدقاء
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-[var(--text-muted)]
              "
            >
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

        {/* =================================================
            FRIENDS LIST
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            pb-6
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

              <p className="font-semibold">
                لا يوجد أصدقاء بعد
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[var(--text-muted)]
                "
              >
                ابحث عن أشخاص وأرسل لهم طلب صداقة
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(
                (friend: any) => (
                  <button
                    key={friend.uid}
                    type="button"
                    onClick={() =>
                      handleSelectFriend(
                        friend
                      )
                    }
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
                    "
                  >
                    <div
                      className="
                        relative
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[var(--glass-border)]
                        bg-[var(--glass-bg-strong)]
                        font-bold
                      "
                    >
                      {friend.username
                        ? friend.username
                            .charAt(0)
                            .toUpperCase()
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

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          font-semibold
                        "
                      >
                        {friend.username}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-emerald-500/80
                        "
                      >
                        متصل الآن
                      </p>
                    </div>

                    <span
                      className="
                        text-lg
                        text-[var(--text-muted)]
                      "
                    >
                      ‹
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          MENU
      ================================================= */}

      {menuOpen && (
        <>
          <div
            className="
              fixed
              inset-0
              z-[99990]
              bg-black/60
              backdrop-blur-sm
            "
            onClick={() =>
              setMenuOpen(false)
            }
          />

          <aside
            className="
              fixed
              bottom-3
              right-3
              top-3
              z-[99999]
              flex
              w-[min(350px,calc(100vw-24px))]
              flex-col
              overflow-hidden
              rounded-[32px]
              border
              border-white/10
              bg-[#101010]
              text-white
              shadow-[0_30px_100px_rgba(0,0,0,0.7)]
            "
            dir="rtl"
          >
            {/* =================================================
                MENU HEADER
            ================================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-white/10
                bg-white/[0.04]
                px-5
                py-5
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  القائمة
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-white/40
                  "
                >
                  AlwadiChat
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="
                  flex
                  h-10
                  w-10
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.06]
                  text-xl
                  text-white
                  transition
                  hover:bg-white/[0.12]
                  active:scale-90
                "
              >
                ×
              </button>
            </div>

            {/* =================================================
                MENU CONTENT
            ================================================= */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                p-4
              "
            >
              {/* PROFILE */}

              <button
                type="button"
                onClick={() =>
                  navigate("/profile")
                }
                className="
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-[22px]
                  border
                  border-white/10
                  bg-white/[0.055]
                  p-4
                  text-right
                  text-white
                  transition
                  hover:bg-white/[0.10]
                  active:scale-[0.98]
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-[15px]
                    bg-white/[0.08]
                    text-xl
                  "
                >
                  👤
                </div>

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <p className="font-semibold">
                    الملف الشخصي
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/40
                    "
                  >
                    حسابك ومعلوماتك
                  </p>
                </div>

                <span
                  className="
                    text-lg
                    text-white/30
                  "
                >
                  ‹
                </span>
              </button>

              {/* SEARCH + REQUESTS */}

              <div
                className="
                  mt-3
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("/search")
                  }
                  className="
                    cursor-pointer
                    rounded-[22px]
                    border
                    border-white/10
                    bg-white/[0.055]
                    p-4
                    text-right
                    text-white
                    transition
                    hover:bg-white/[0.10]
                    active:scale-[0.98]
                  "
                >
                  <div className="text-xl">
                    🔍
                  </div>

                  <p className="mt-3 font-semibold">
                    بحث
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/40
                    "
                  >
                    ابحث عن أصدقاء
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/requests")
                  }
                  className="
                    cursor-pointer
                    rounded-[22px]
                    border
                    border-white/10
                    bg-white/[0.055]
                    p-4
                    text-right
                    text-white
                    transition
                    hover:bg-white/[0.10]
                    active:scale-[0.98]
                  "
                >
                  <div className="text-xl">
                    📩
                  </div>

                  <p className="mt-3 font-semibold">
                    الطلبات
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/40
                    "
                  >
                    طلبات الصداقة
                  </p>
                </button>
              </div>

              {/* =================================================
                  APPEARANCE
              ================================================= */}

              <div
                className="
                  mt-3
                  rounded-[22px]
                  border
                  border-white/10
                  bg-white/[0.055]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-[15px]
                      bg-white/[0.08]
                      text-xl
                    "
                  >
                    ⚙️
                  </div>

                  <div>
                    <p className="font-semibold">
                      المظهر
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-white/40
                      "
                    >
                      اختر شكل التطبيق
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-2
                    rounded-[18px]
                    bg-black/30
                    p-1
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeTheme("dark")
                    }
                    className={`
                      cursor-pointer
                      rounded-[14px]
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      transition
                      ${
                        theme === "dark"
                          ? "bg-white/10 text-white shadow-lg"
                          : "text-white/40 hover:bg-white/[0.05]"
                      }
                    `}
                  >
                    🌙 داكن
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeTheme("light")
                    }
                    className={`
                      cursor-pointer
                      rounded-[14px]
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      transition
                      ${
                        theme === "light"
                          ? "bg-white text-black shadow-lg"
                          : "text-white/40 hover:bg-white/[0.05]"
                      }
                    `}
                  >
                    ☀️ فاتح
                  </button>
                </div>
              </div>

              {/* =================================================
                  DELETE ALL CHATS
              ================================================= */}

              <button
                type="button"
                onClick={
                  askDeleteAllChats
                }
                disabled={
                  deletingAllChats
                }
                className="
                  mt-3
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-[22px]
                  border
                  border-red-500/15
                  bg-red-500/[0.07]
                  p-4
                  text-right
                  text-white
                  transition
                  hover:bg-red-500/[0.12]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-[15px]
                    bg-red-500/10
                    text-xl
                  "
                >
                  🗑️
                </div>

                <div className="flex-1">
                  <p
                    className="
                      font-semibold
                      text-red-400
                    "
                  >
                    حذف جميع المحادثات
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-400/50
                    "
                  >
                    حذف جميع الرسائل نهائياً
                  </p>
                </div>
              </button>

              {/* =================================================
                  LOGOUT
              ================================================= */}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  mt-3
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  gap-4
                  rounded-[22px]
                  border
                  border-red-500/15
                  bg-red-500/[0.07]
                  p-4
                  text-right
                  text-white
                  transition
                  hover:bg-red-500/[0.12]
                  active:scale-[0.98]
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-[15px]
                    bg-red-500/10
                    text-xl
                  "
                >
                  🚪
                </div>

                <div className="flex-1">
                  <p
                    className="
                      font-semibold
                      text-red-400
                    "
                  >
                    تسجيل الخروج
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-400/50
                    "
                  >
                    الخروج من الحساب
                  </p>
                </div>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* =================================================
          DELETE ALL CONFIRMATION
      ================================================= */}

      {showDeleteAllConfirm && (
        <>
          {/* BACKDROP */}

          <div
            className="
              fixed
              inset-0
              z-[100000]
              bg-black/60
              backdrop-blur-sm
            "
            onClick={() => {
              if (!deletingAllChats) {
                setShowDeleteAllConfirm(
                  false
                );
              }
            }}
          />

          {/* CONFIRM BOX */}

          <div
            className="
              fixed
              left-1/2
              top-1/2
              z-[100001]
              w-[min(380px,calc(100vw-32px))]
              -translate-x-1/2
              -translate-y-1/2
              rounded-[28px]
              border
              border-white/10
              bg-[#151515]
              p-6
              text-white
              shadow-[0_30px_100px_rgba(0,0,0,0.7)]
            "
            dir="rtl"
          >
            {/* ICON */}

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-[20px]
                bg-red-500/10
                text-3xl
              "
            >
              🗑️
            </div>

            {/* TITLE */}

            <h3
              className="
                mt-5
                text-center
                text-lg
                font-bold
              "
            >
              حذف جميع المحادثات؟
            </h3>

            {/* DESCRIPTION */}

            <p
              className="
                mt-2
                text-center
                text-sm
                leading-6
                text-white/50
              "
            >
              سيتم حذف جميع الرسائل
              الموجودة في جميع محادثاتك.
              <br />
              <span className="font-semibold text-red-400/80">
                لا يمكن التراجع عن هذا الإجراء.
              </span>
            </p>

            {/* BUTTONS */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
              "
            >
              <button
                type="button"
                disabled={
                  deletingAllChats
                }
                onClick={() =>
                  setShowDeleteAllConfirm(
                    false
                  )
                }
                className="
                  cursor-pointer
                  rounded-[16px]
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-4
                  py-3
                  font-semibold
                  text-white/80
                  transition
                  hover:bg-white/[0.10]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={
                  deletingAllChats
                }
                onClick={
                  confirmDeleteAllChats
                }
                className="
                  cursor-pointer
                  rounded-[16px]
                  bg-red-500
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deletingAllChats
                  ? "جاري الحذف..."
                  : "حذف الكل"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}