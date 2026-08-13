"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  listenToConversations,
  type Conversation,
} from "@/lib/chat/conversations";

import {
  listenToPresence,
  type UserPresence,
} from "@/lib/chat/presence";

import ConversationItem, {
  type ConversationUser,
} from "./ConversationItem";

// =========================================================
// TYPES
// =========================================================

type ConversationListProps = {
  myUid: string;

  users?: ConversationUser[];

  selectedFriendUid?: string | null;

  onSelectConversation?: (
    friendUid: string
  ) => void;

  showArchived?: boolean;

  searchQuery?: string;

  className?: string;
};

// =========================================================
// COMPONENT
// =========================================================

export default function ConversationList({
  myUid,
  users = [],
  selectedFriendUid = null,
  onSelectConversation,
  showArchived = false,
  searchQuery = "",
  className = "",
}: ConversationListProps) {
  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    presenceMap,
    setPresenceMap,
  ] = useState<
    Record<
      string,
      UserPresence
    >
  >({});

  // =======================================================
  // REALTIME CONVERSATIONS
  // =======================================================

  useEffect(() => {
    if (!myUid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe =
      listenToConversations(
        myUid,
        (items) => {
          setConversations(
            items
          );

          setLoading(false);
        }
      );

    return () => {
      unsubscribe?.();
    };
  }, [myUid]);

  // =======================================================
  // PRESENCE LISTENERS
  // =======================================================

  useEffect(() => {
    if (!myUid) {
      setPresenceMap({});
      return;
    }

    const friendIds =
      conversations
        .map(
          (conversation) =>
            conversation.friendId
        )
        .filter(Boolean);

    if (
      friendIds.length === 0
    ) {
      setPresenceMap({});
      return;
    }

    const unsubscribers =
      friendIds.map(
        (friendUid) => {
          return listenToPresence(
            friendUid,
            (presence) => {
              setPresenceMap(
                (previous) => ({
                  ...previous,
                  [friendUid]:
                    presence,
                })
              );
            }
          );
        }
      );

    return () => {
      unsubscribers.forEach(
        (unsubscribe) => {
          unsubscribe?.();
        }
      );
    };
  }, [
    myUid,
    conversations,
  ]);

  // =======================================================
  // USERS MAP
  // =======================================================

  const usersMap =
    useMemo(() => {
      const map: Record<
        string,
        ConversationUser
      > = {};

      users.forEach((user) => {
        if (user.uid) {
          map[user.uid] =
            user;
        }
      });

      return map;
    }, [users]);

  // =======================================================
  // FILTER
  // =======================================================

  const filteredConversations =
    useMemo(() => {
      const queryText =
        searchQuery
          .trim()
          .toLowerCase();

      return conversations.filter(
        (conversation) => {
          // Archived filter

          if (
            showArchived !==
            conversation.isArchived
          ) {
            return false;
          }

          // Search

          if (!queryText) {
            return true;
          }

          const user =
            usersMap[
              conversation.friendId
            ];

          const name =
            user?.displayName ??
            "";

          const username =
            user?.username ??
            "";

          const email =
            user?.email ??
            "";

          const lastMessage =
            conversation.lastMessage ??
            "";

          const searchable =
            [
              name,
              username,
              email,
              lastMessage,
            ]
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            queryText
          );
        }
      );
    }, [
      conversations,
      showArchived,
      searchQuery,
      usersMap,
    ]);

  // =======================================================
  // EMPTY STATE
  // =======================================================

  if (!myUid) {
    return (
      <div
        className={[
          "flex h-full min-h-[200px] items-center justify-center",
          className,
        ].join(" ")}
        dir="rtl"
      >
        <div className="text-center">
          <div className="mb-2 text-3xl">
            🔐
          </div>

          <p className="text-sm text-white/45">
            سجّل الدخول لعرض المحادثات
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        className={[
          "space-y-2 p-2",
          className,
        ].join(" ")}
        dir="rtl"
      >
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              px-3
              py-3
            "
          >
            {/* Avatar */}

            <div
              className="
                h-12
                w-12
                shrink-0
                animate-pulse
                rounded-full
                bg-white/[0.07]
              "
            />

            {/* Text */}

            <div className="flex-1 space-y-2">
              <div
                className="
                  h-3
                  w-1/2
                  animate-pulse
                  rounded
                  bg-white/[0.07]
                "
              />

              <div
                className="
                  h-3
                  w-3/4
                  animate-pulse
                  rounded
                  bg-white/[0.05]
                "
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <div
        className={[
          "flex h-full min-h-[200px] items-center justify-center px-5",
          className,
        ].join(" ")}
        dir="rtl"
      >
        <div className="text-center">
          <div className="mb-3 text-3xl">
            ⚠️
          </div>

          <p className="mb-3 text-sm text-red-400">
            حدث خطأ أثناء تحميل المحادثات
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="
              rounded-xl
              bg-white/[0.08]
              px-4
              py-2
              text-xs
              text-white/70
              transition
              hover:bg-white/[0.12]
              hover:text-white
            "
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // =======================================================
  // EMPTY
  // =======================================================

  if (
    filteredConversations.length ===
    0
  ) {
    return (
      <div
        className={[
          "flex h-full min-h-[240px] items-center justify-center px-6",
          className,
        ].join(" ")}
        dir="rtl"
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-3xl
              bg-white/[0.05]
              text-3xl
            "
          >
            {searchQuery
              ? "🔎"
              : showArchived
                ? "📦"
                : "💬"}
          </div>

          <h3 className="text-sm font-semibold text-white/80">
            {searchQuery
              ? "لا توجد نتائج"
              : showArchived
                ? "لا توجد محادثات مؤرشفة"
                : "لا توجد محادثات بعد"}
          </h3>

          <p className="mt-1 text-xs leading-5 text-white/35">
            {searchQuery
              ? "جرّب البحث باسم مستخدم آخر"
              : showArchived
                ? "المحادثات التي تقوم بأرشفتها ستظهر هنا"
                : "ابدأ محادثة جديدة مع أحد أصدقائك"}
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // LIST
  // =======================================================

  return (
    <div
      className={[
        "h-full min-h-0 overflow-y-auto px-1 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10",
        className,
      ].join(" ")}
      dir="rtl"
    >
      <div className="space-y-1">
        {filteredConversations.map(
          (
            conversation
          ) => {
            const friendUid =
              conversation.friendId;

            const user =
              usersMap[
                friendUid
              ];

            // إذا المستخدم غير موجود ضمن users
            // ننشئ بيانات احتياطية

            const fallbackUser: ConversationUser =
              {
                uid: friendUid,
                displayName:
                  "مستخدم",
              };

            const conversationUser =
              user ??
              fallbackUser;

            return (
              <ConversationItem
                key={
                  conversation.id
                }
                conversation={
                  conversation
                }
                user={
                  conversationUser
                }
                presence={
                  presenceMap[
                    friendUid
                  ] ?? null
                }
                selected={
                  selectedFriendUid ===
                  friendUid
                }
                showArchived={
                  showArchived
                }
                onClick={() => {
                  onSelectConversation?.(
                    friendUid
                  );
                }}
                onArchive={() => {
                  // يتم التعامل مع الأرشفة
                  // من المكون الأب حالياً.
                  //
                  // لا ننفذ Firebase مباشرة هنا
                  // حتى يبقى ConversationList
                  // مكون عرض فقط.
                }}
                onUnarchive={() => {
                  // نفس الفكرة
                }}
              />
            );
          }
        )}
      </div>
    </div>
  );
}