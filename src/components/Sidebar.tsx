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

  useEffect(() => {
    const unsubscribe = listenToAuth((user) => {
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

  return (
    <aside className="h-full w-full bg-gray-950 text-white flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-800 shrink-0">
        <h1 className="text-2xl font-bold">
          AlwadiChat 💬
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          دردش مع أصدقائك
        </p>
      </div>

      {/* Buttons */}
      <div className="px-4 pt-4 shrink-0">

        <button
          onClick={() => router.push("/profile")}
          className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-2xl mb-3 text-right font-bold transition"
        >
          👤
          <span className="mr-2">
            الملف الشخصي
          </span>
        </button>

        <div className="flex gap-2 mb-3">

          <button
            onClick={() => router.push("/search")}
            className="flex-1 bg-white text-black py-3.5 rounded-2xl font-bold active:scale-95 transition"
          >
            🔍 بحث
          </button>

          <button
            onClick={() => router.push("/requests")}
            className="flex-1 bg-gray-900 border border-gray-800 py-3.5 rounded-2xl font-bold active:scale-95 transition"
          >
            📩 طلبات
          </button>

        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 p-3.5 rounded-2xl font-bold transition"
        >
          🚪 تسجيل الخروج
        </button>

      </div>

      {/* Friends title */}
      <div className="px-5 pt-6 pb-3 shrink-0">
        <div className="flex items-center justify-between">

          <h2 className="text-gray-300 font-bold text-lg">
            الأصدقاء
          </h2>

          <span className="text-xs text-gray-500">
            {friends.length}
          </span>

        </div>
      </div>

      {/* Friends */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">

        {friends.length === 0 ? (

          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">

            <div className="text-4xl mb-3">
              👥
            </div>

            <p className="text-gray-400">
              لا يوجد أصدقاء بعد
            </p>

            <p className="text-gray-600 text-sm mt-1">
              ابحث عن أشخاص وأرسل لهم طلب صداقة
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {friends.map((friend: any) => (

              <button
                key={friend.uid}
                onClick={() => {
                  setSelectedUser({
                    id: friend.uid,
                    name: friend.username,
                    status: "Online",
                  });
                }}
                className="w-full flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-900 hover:border-gray-700 p-3.5 rounded-2xl text-right transition"
              >

                <div className="w-12 h-12 min-w-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                  {friend.username
                    ? friend.username.charAt(0).toUpperCase()
                    : "?"}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="font-bold truncate">
                    {friend.username}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">

                    <span className="w-2 h-2 rounded-full bg-green-500" />

                    <p className="text-xs text-gray-500">
                      Online
                    </p>

                  </div>

                </div>

                <span className="text-gray-600 text-xl">
                  ‹
                </span>

              </button>

            ))}

          </div>

        )}

      </div>

    </aside>
  );
}