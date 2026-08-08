"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuthConfig";

import { getFriends } from "@/lib/friends";
import { listenToAuth } from "@/lib/authListener";

export default function Sidebar({
  setSelectedUser,
}: any) {
  const router = useRouter();

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

  return (
    <aside className="relative h-full w-full overflow-hidden bg-black text-white">

      {/* Ambient background */}
      <div
        className="
          pointer-events-none
          absolute
          -top-32
          -left-24
          w-72
          h-72
          rounded-full
          bg-blue-500/[0.08]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          top-1/2
          -right-32
          w-72
          h-72
          rounded-full
          bg-purple-500/[0.05]
          blur-3xl
        "
      />

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col">

        {/* Header */}
        <header
          className="
            shrink-0
            px-4
            pt-4
            pb-3
            md:px-5
            md:pt-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              rounded-[24px]
              border
              border-white/[0.08]
              bg-white/[0.055]
              px-4
              py-3.5
              backdrop-blur-2xl
              shadow-[0_12px_40px_rgba(0,0,0,0.25)]
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
                  bg-white/[0.08]
                  border
                  border-white/[0.08]
                  text-lg
                "
              >
                💬
              </div>

              <div className="min-w-0">

                <h1 className="truncate text-base font-bold">
                  AlwadiChat
                </h1>

                <p className="mt-0.5 text-[11px] text-white/35">
                  دردش مع أصدقائك
                </p>

              </div>

            </div>

            {/* Menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full

                border
                border-white/[0.1]

                bg-white/[0.07]

                backdrop-blur-xl

                text-xl
                text-white/80

                shadow-[0_8px_30px_rgba(0,0,0,0.25)]

                transition-all
                duration-200

                hover:bg-white/[0.11]
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

            <h2 className="text-lg font-bold">
              الأصدقاء
            </h2>

            <p className="mt-0.5 text-xs text-white/30">
              {friends.length} أصدقاء
            </p>

          </div>

          <div
            className="
              flex
              h-8
              min-w-8
              items-center
              justify-center
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.05]
              px-2
              text-xs
              text-white/50
              backdrop-blur-xl
            "
          >
            {friends.length}
          </div>

        </div>

        {/* Friends list */}
        <div
          className="
            flex-1
            min-h-0
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
                mt-4
                rounded-[28px]
                border
                border-white/[0.08]
                bg-white/[0.045]
                p-7
                text-center
                backdrop-blur-2xl
                shadow-[0_20px_60px_rgba(0,0,0,0.2)]
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
                  bg-white/[0.07]
                  border
                  border-white/[0.08]
                  text-3xl
                "
              >
                👥
              </div>

              <p className="font-semibold text-white/70">
                لا يوجد أصدقاء بعد
              </p>

              <p className="mt-2 text-sm leading-6 text-white/30">
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
                    group
                    w-full
                    flex
                    items-center
                    gap-3
                    rounded-[22px]
                    border
                    border-white/[0.055]
                    bg-white/[0.045]
                    p-3
                    text-right

                    backdrop-blur-xl

                    transition-all
                    duration-200

                    hover:bg-white/[0.075]
                    hover:border-white/[0.1]

                    active:scale-[0.985]
                  "
                >

                  {/* Avatar */}
                  <div
                    className="
                      relative
                      h-12
                      w-12
                      shrink-0
                      overflow-hidden
                      rounded-full
                      border
                      border-white/[0.1]
                      bg-white/[0.08]
                      flex
                      items-center
                      justify-center
                      text-base
                      font-bold
                      text-white/80
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
                        border-black
                        bg-emerald-400
                      "
                    />
                  </div>

                  {/* User info */}
                  <div className="min-w-0 flex-1">

                    <p className="truncate font-semibold text-white/90">
                      {friend.username}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">

                      <span className="text-[11px] text-emerald-400/80">
                        متصل الآن
                      </span>

                    </div>

                  </div>

                  {/* Arrow */}
                  <span
                    className="
                      px-1
                      text-lg
                      text-white/20
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

      {/* Dark overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`
          absolute
          inset-0
          z-40
          bg-black/50
          backdrop-blur-[2px]
          transition-opacity
          duration-300

          ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* Glass menu */}
      <div
        className={`
          absolute
          right-3
          top-3
          bottom-3
          z-50
          w-[min(330px,calc(100%-24px))]

          rounded-[32px]

          border
          border-white/[0.12]

          bg-[#111111]/80

          backdrop-blur-3xl

          shadow-[0_25px_80px_rgba(0,0,0,0.55)]

          transition-all
          duration-300
          ease-out

          ${
            menuOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-[110%] opacity-0"
          }
        `}
      >

        {/* Menu header */}
        <div className="flex items-center justify-between p-4">

          <div>

            <p className="text-lg font-bold">
              القائمة
            </p>

            <p className="mt-0.5 text-xs text-white/35">
              AlwadiChat
            </p>

          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="إغلاق القائمة"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.06]
              text-lg
              text-white/60
              transition
              active:scale-90
            "
          >
            ×
          </button>

        </div>

        {/* Menu content */}
        <div className="px-3">

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-[22px]
              border
              border-white/[0.06]
              bg-white/[0.045]
              p-4
              text-right
              transition
              hover:bg-white/[0.08]
              active:scale-[0.98]
            "
          >

            <span className="text-xl">
              👤
            </span>

            <div className="flex-1">

              <p className="font-semibold">
                الملف الشخصي
              </p>

              <p className="mt-1 text-xs text-white/30">
                حسابك ومعلوماتك
              </p>

            </div>

            <span className="text-white/20">
              ‹
            </span>

          </button>

          <div className="mt-2 grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="
                rounded-[22px]
                border
                border-white/[0.06]
                bg-white/[0.045]
                p-4
                text-right
                transition
                hover:bg-white/[0.08]
                active:scale-[0.98]
              "
            >

              <span className="text-xl">
                🔍
              </span>

              <p className="mt-2 font-semibold">
                بحث
              </p>

              <p className="mt-1 text-xs text-white/30">
                ابحث عن أصدقاء
              </p>

            </button>

            <button
              type="button"
              onClick={() => navigate("/requests")}
              className="
                rounded-[22px]
                border
                border-white/[0.06]
                bg-white/[0.045]
                p-4
                text-right
                transition
                hover:bg-white/[0.08]
                active:scale-[0.98]
              "
            >

              <span className="text-xl">
                📩
              </span>

              <p className="mt-2 font-semibold">
                الطلبات
              </p>

              <p className="mt-1 text-xs text-white/30">
                طلبات الصداقة
              </p>

            </button>

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
              border-red-400/[0.1]
              bg-red-500/[0.07]
              p-4
              text-right
              transition
              hover:bg-red-500/[0.12]
              active:scale-[0.98]
            "
          >

            <span className="text-xl">
              🚪
            </span>

            <div className="flex-1">

              <p className="font-semibold text-red-300">
                تسجيل الخروج
              </p>

              <p className="mt-1 text-xs text-red-300/40">
                الخروج من الحساب
              </p>

            </div>

          </button>

        </div>

      </div>

    </aside>
  );
}