"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  endAt,
} from "firebase/firestore";
import { Check, UserMinus, UserPlus, UserSearch, UserX, X } from "lucide-react";

import { db } from "../../../../lib/firebase";
import { t } from "../../../../lib/translations";
import type {
  FriendEntry,
  FriendRequestEntry,
  ProfileIconColor,
  UserProfileDocument,
} from "../profileTypes";
import {
  getProfileIconStyle,
  getProfileInitials,
  normalizeProfileIconColor,
} from "../profileDisplay";
import FriendProfileModal from "../modals/FriendProfileModal";
import MessageModal from "../../modal/MessageModal";

type SearchResult = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  iconColor: ProfileIconColor;
  profileVisibility: "everyone" | "friends" | "me";
  collectionVisibility: "everyone" | "friends" | "me";
  wishlistVisibility: "everyone" | "friends" | "me";
};

type ProfileFriendsPanelProps = {
  user: User;
  locale: "en" | "nl";
};

function normalizeUserResult(uid: string, raw: unknown): SearchResult | null {
  const base =
    typeof raw === "object" && raw ? (raw as Record<string, unknown>) : null;
  if (!base) return null;
  const email = typeof base.email === "string" ? base.email : "";
  const firstName = typeof base.firstName === "string" ? base.firstName : "";
  const lastName = typeof base.lastName === "string" ? base.lastName : "";
  const iconColor = normalizeProfileIconColor(base.iconColor);

  const privacyRaw =
    typeof base.privacy === "object" && base.privacy
      ? (base.privacy as Record<string, unknown>)
      : {};
  const profileVisibility =
    privacyRaw.profile === "everyone" ||
    privacyRaw.profile === "friends" ||
    privacyRaw.profile === "me"
      ? (privacyRaw.profile as SearchResult["profileVisibility"])
      : "everyone";
  const collectionVisibility =
    privacyRaw.collection === "everyone" ||
    privacyRaw.collection === "friends" ||
    privacyRaw.collection === "me"
      ? (privacyRaw.collection as SearchResult["collectionVisibility"])
      : "friends";
  const wishlistVisibility =
    privacyRaw.wishlist === "everyone" ||
    privacyRaw.wishlist === "friends" ||
    privacyRaw.wishlist === "me"
      ? (privacyRaw.wishlist as SearchResult["wishlistVisibility"])
      : "friends";

  if (profileVisibility === "me") return null;
  if (!email && !firstName && !lastName) return null;

  return {
    uid,
    email,
    firstName,
    lastName,
    iconColor,
    profileVisibility,
    collectionVisibility,
    wishlistVisibility,
  };
}

export default function ProfileFriendsPanel({
  user,
  locale,
}: ProfileFriendsPanelProps) {
  const [queryText, setQueryText] = useState("");
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");

  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [removeTarget, setRemoveTarget] = useState<FriendEntry | null>(null);

  const [incomingRequests, setIncomingRequests] = useState<
    FriendRequestEntry[]
  >([]);
  const [outgoingRequests, setOutgoingRequests] = useState<
    FriendRequestEntry[]
  >([]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUid, setProfileUid] = useState<string | null>(null);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "Friends");
    const q = query(ref, orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as Record<string, unknown>;
            const uid = typeof data.uid === "string" ? data.uid : docSnap.id;
            return {
              uid,
              firstName:
                typeof data.firstName === "string" ? data.firstName : undefined,
              lastName:
                typeof data.lastName === "string" ? data.lastName : undefined,
              email: typeof data.email === "string" ? data.email : undefined,
              iconColor: normalizeProfileIconColor(data.iconColor),
              addedAt: data.addedAt,
            } satisfies FriendEntry;
          })
          .filter((f) => !!f.uid);
        setFriends(next);
      },
      () => setFriends([]),
    );

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "FriendRequestsIncoming");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const uid = typeof data.uid === "string" ? data.uid : docSnap.id;
          return {
            uid,
            firstName:
              typeof data.firstName === "string" ? data.firstName : undefined,
              lastName:
                typeof data.lastName === "string" ? data.lastName : undefined,
              email: typeof data.email === "string" ? data.email : undefined,
              iconColor: normalizeProfileIconColor(data.iconColor),
              createdAt: data.createdAt,
            } satisfies FriendRequestEntry;
        });
        setIncomingRequests(next);
      },
      () => setIncomingRequests([]),
    );

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "FriendRequestsOutgoing");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const uid = typeof data.uid === "string" ? data.uid : docSnap.id;
          return {
            uid,
            firstName:
              typeof data.firstName === "string" ? data.firstName : undefined,
              lastName:
                typeof data.lastName === "string" ? data.lastName : undefined,
              email: typeof data.email === "string" ? data.email : undefined,
              iconColor: normalizeProfileIconColor(data.iconColor),
              createdAt: data.createdAt,
            } satisfies FriendRequestEntry;
        });
        setOutgoingRequests(next);
      },
      () => setOutgoingRequests([]),
    );

    return () => unsubscribe();
  }, [user.uid]);

  const friendUids = useMemo(
    () => new Set(friends.map((f) => f.uid)),
    [friends],
  );
  const outgoingUids = useMemo(
    () => new Set(outgoingRequests.map((r) => r.uid)),
    [outgoingRequests],
  );

  const buildPrefixQuery = (field: string, termLower: string) => {
    return query(
      collection(db, "users"),
      orderBy(field),
      startAt(termLower),
      endAt(`${termLower}\uf8ff`),
      limit(10),
    );
  };

  const runSearch = async () => {
    const term = queryText.trim();
    if (!term) {
      setResults([]);
      setSearchError("");
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setHasSearched(true);
    setSearchError("");
    setResults([]);

    try {
      const termLower = term.toLowerCase();
      const normalizedRaw = term.replace(/\s+/g, " ").trim();
      const normalizedSpaces = termLower.replace(/\s+/g, " ").trim();
      const firstWord = normalizedSpaces.split(" ")[0] ?? normalizedSpaces;
      const lastWord = normalizedSpaces.split(" ").slice(-1)[0] ?? firstWord;
      const firstWordRaw = normalizedRaw.split(" ")[0] ?? normalizedRaw;
      const lastWordRaw = normalizedRaw.split(" ").slice(-1)[0] ?? firstWordRaw;

      const searches: Array<ReturnType<typeof getDocs>> = [];
      if (term.includes("@")) {
        searches.push(getDocs(buildPrefixQuery("emailLower", termLower)));
        searches.push(getDocs(buildPrefixQuery("email", term)));
      } else {
        searches.push(
          getDocs(buildPrefixQuery("fullNameLower", normalizedSpaces)),
        );
        searches.push(getDocs(buildPrefixQuery("firstNameLower", firstWord)));
        searches.push(getDocs(buildPrefixQuery("lastNameLower", lastWord)));

        // Fallback for older docs without lowercased fields
        searches.push(getDocs(buildPrefixQuery("firstName", firstWordRaw)));
        searches.push(getDocs(buildPrefixQuery("lastName", lastWordRaw)));
      }

      const snaps = await Promise.allSettled(searches);
      const merged = new Map<string, SearchResult>();

      for (const snapResult of snaps) {
        if (snapResult.status !== "fulfilled") continue;
        for (const d of snapResult.value.docs) {
          if (d.id === user.uid) continue;
          if (friendUids.has(d.id)) continue;
          const normalized = normalizeUserResult(d.id, d.data());
          if (!normalized) continue;
          merged.set(normalized.uid, normalized);
        }
      }

      setResults(Array.from(merged.values()));
    } catch {
      setSearchError(t(locale, "searchFailed"));
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (queryText.trim()) return;
    setResults([]);
    setSearchError("");
    setHasSearched(false);
  }, [queryText]);

  const sendFriendRequest = async (target: SearchResult) => {
    const outgoingRef = doc(
      db,
      "users",
      user.uid,
      "FriendRequestsOutgoing",
      target.uid,
    );
    const incomingRef = doc(
      db,
      "users",
      target.uid,
      "FriendRequestsIncoming",
      user.uid,
    );

    const meProfileSnap = await getDoc(doc(db, "users", user.uid));
    const meProfile = (meProfileSnap.data() ?? {}) as UserProfileDocument;

    await Promise.all([
      setDoc(
        outgoingRef,
        {
          uid: target.uid,
          firstName: target.firstName,
          lastName: target.lastName,
          email: target.email,
          iconColor: target.iconColor,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
      setDoc(
        incomingRef,
        {
          uid: user.uid,
          firstName:
            typeof meProfile.firstName === "string" ? meProfile.firstName : "",
          lastName:
            typeof meProfile.lastName === "string" ? meProfile.lastName : "",
          email:
            typeof meProfile.email === "string"
              ? meProfile.email
              : (user.email ?? ""),
          iconColor: normalizeProfileIconColor(meProfile.iconColor),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ]);
  };

  const revokeFriendRequest = async (targetUid: string) => {
    await Promise.all([
      deleteDoc(
        doc(db, "users", user.uid, "FriendRequestsOutgoing", targetUid),
      ),
      deleteDoc(
        doc(db, "users", targetUid, "FriendRequestsIncoming", user.uid),
      ),
    ]);
  };

  const acceptRequest = async (from: FriendRequestEntry) => {
    const meRef = doc(db, "users", user.uid, "Friends", from.uid);
    const themRef = doc(db, "users", from.uid, "Friends", user.uid);

    const meProfileSnap = await getDoc(doc(db, "users", user.uid));
    const meProfile = (meProfileSnap.data() ?? {}) as UserProfileDocument;

    await Promise.all([
      setDoc(
        meRef,
        {
          uid: from.uid,
          firstName: from.firstName ?? "",
          lastName: from.lastName ?? "",
          email: from.email ?? "",
          iconColor: normalizeProfileIconColor(from.iconColor),
          addedAt: serverTimestamp(),
        },
        { merge: true },
      ),
      setDoc(
        themRef,
        {
          uid: user.uid,
          firstName:
            typeof meProfile.firstName === "string" ? meProfile.firstName : "",
          lastName:
            typeof meProfile.lastName === "string" ? meProfile.lastName : "",
          email:
            typeof meProfile.email === "string"
              ? meProfile.email
              : (user.email ?? ""),
          iconColor: normalizeProfileIconColor(meProfile.iconColor),
          addedAt: serverTimestamp(),
        },
        { merge: true },
      ),
      deleteDoc(doc(db, "users", user.uid, "FriendRequestsIncoming", from.uid)),
      deleteDoc(doc(db, "users", from.uid, "FriendRequestsOutgoing", user.uid)),
    ]);
  };

  const rejectRequest = async (from: FriendRequestEntry) => {
    await Promise.all([
      deleteDoc(doc(db, "users", user.uid, "FriendRequestsIncoming", from.uid)),
      deleteDoc(doc(db, "users", from.uid, "FriendRequestsOutgoing", user.uid)),
    ]);
  };

  const removeFriend = async (target: FriendEntry) => {
    await Promise.all([
      deleteDoc(doc(db, "users", user.uid, "Friends", target.uid)),
      deleteDoc(doc(db, "users", target.uid, "Friends", user.uid)),
    ]);
  };

  const renderAvatar = (
    firstName?: string,
    lastName?: string,
    iconColor?: ProfileIconColor,
  ) => (
    <div
      className="w-10 h-10 rounded-full border profile__surface__usericon flex items-center justify-center font-semibold text-xs shrink-0"
      style={getProfileIconStyle(iconColor ?? "amber")}
    >
      {getProfileInitials(firstName, lastName)}
    </div>
  );

  return (
    <>
      <section className="profile__surface border rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold">
          {t(locale, "friends")}
        </h2>
        <p className="profile__muted text-sm mt-1">
          {t(locale, "friendsHint")}
        </p>

        {incomingRequests.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-md font-semibold">
                {t(locale, "friendRequests")}{" "}
                <span className="profile__badge ml-2">
                  {incomingRequests.length}
                </span>
              </h3>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {incomingRequests.map((r) => (
                <div
                  key={r.uid}
                  className="profile__surface border rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex items-start gap-3">
                    {renderAvatar(r.firstName, r.lastName, r.iconColor)}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {r.firstName ?? ""} {r.lastName ?? ""}
                      </div>
                      <div className="profile__muted truncate">
                        {r.email ?? ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="profile__btn--primary border rounded-lg px-3 py-2 cursor-pointer"
                      onClick={() => acceptRequest(r)}
                      aria-label={t(locale, "accept")}
                      title={t(locale, "accept")}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      type="button"
                      className="profile__btn--secondary border rounded-lg px-3 py-2 cursor-pointer"
                      onClick={() => rejectRequest(r)}
                      aria-label={t(locale, "reject")}
                      title={t(locale, "reject")}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {outgoingRequests.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold">{t(locale, "requested")}</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {outgoingRequests.map((r) => (
                <div
                  key={r.uid}
                  className="profile__surface border rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex items-start gap-3">
                    {renderAvatar(r.firstName, r.lastName, r.iconColor)}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {r.firstName ?? ""} {r.lastName ?? ""}
                      </div>
                      <div className="profile__muted truncate">
                        {r.email ?? ""}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="profile__btn--secondary flex items-center gap-2 border rounded-lg px-3 py-2 shrink-0  cursor-pointer"
                    onClick={() => revokeFriendRequest(r.uid)}
                  >
                    <UserMinus size={18} />
                    {t(locale, "revokeRequest")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              className="profile__input border rounded-lg px-3 py-2 pr-10 w-full"
              value={queryText}
              onChange={(e) => {
                setQueryText(e.target.value);
                setHasSearched(false);
              }}
              placeholder={t(locale, "searchFriendsPlaceholder")}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                void runSearch();
              }}
            />
            {queryText.trim() && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 profile__muted hover:opacity-80 cursor-pointer"
                onClick={() => {
                  setQueryText("");
                  setResults([]);
                  setSearchError("");
                  setHasSearched(false);
                }}
                aria-label={t(locale, "remove")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="profile__btn--primary flex items-center gap-2 border rounded-lg px-4 py-2 cursor-pointer"
            onClick={runSearch}
            disabled={searching || !queryText.trim()}
          >
            <UserSearch size={20} />
            {searching ? `${t(locale, "searching")}…` : t(locale, "search")}
          </button>
        </div>

        {searchError && (
          <p className="text-sm mt-3 profile__error">{searchError}</p>
        )}

        {results.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r) => (
              <div
                key={r.uid}
                className={`profile__surface border rounded-xl p-4 flex items-start justify-between gap-4 ${
                  r.profileVisibility === "everyone"
                    ? "cursor-pointer hover:opacity-95"
                    : "cursor-default"
                }`}
                role={r.profileVisibility === "everyone" ? "button" : undefined}
                tabIndex={r.profileVisibility === "everyone" ? 0 : undefined}
                onClick={() => {
                  if (r.profileVisibility !== "everyone") return;
                  setProfileUid(r.uid);
                  setProfileOpen(true);
                }}
                onKeyDown={(event) => {
                  if (r.profileVisibility !== "everyone") return;
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setProfileUid(r.uid);
                  setProfileOpen(true);
                }}
              >
                <div className="min-w-0 flex items-start gap-3">
                  {renderAvatar(r.firstName, r.lastName, r.iconColor)}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {r.firstName} {r.lastName}
                    </div>
                    <div className="profile__muted truncate">{r.email}</div>
                    {r.profileVisibility !== "everyone" && (
                      <div className="profile__muted text-xs mt-1">
                        {t(locale, "visibilityFriends")}
                      </div>
                    )}
                  </div>
                </div>
                {outgoingUids.has(r.uid) ? (
                  <span className="profile__muted text-sm font-semibold shrink-0">
                    {t(locale, "requested")}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="profile__btn--primary flex items-center gap-2 border rounded-lg px-3 py-2 shrink-0 cursor-pointer"
                    onClick={(event) => {
                      event.stopPropagation();
                      void sendFriendRequest(r);
                    }}
                  >
                    <UserPlus size={20} />
                    {t(locale, "request")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length === 0 &&
          hasSearched &&
          queryText.trim() &&
          !searching &&
          !searchError && (
            <p className="profile__muted text-sm mt-4">
              {t(locale, "noResult")}
            </p>
          )}
      </section>

      <section className="profile__surface border rounded-xl p-4 sm:p-6 mt-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold">{t(locale, "myFriends")}</h3>
            <p className="profile__muted text-sm mt-1">
              {t(locale, "friendCount", `${friends.length}`)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {friends.map((f) => (
            <div
              key={f.uid}
              className="text-left profile__surface border rounded-xl p-4 transition-opacity hover:opacity-95 cursor-pointer"
              onClick={() => {
                setProfileUid(f.uid);
                setProfileOpen(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                setProfileUid(f.uid);
                setProfileOpen(true);
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex items-start gap-3">
                  {renderAvatar(f.firstName, f.lastName, f.iconColor)}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {f.firstName ?? ""} {f.lastName ?? ""}
                    </div>
                    <div className="profile__muted truncate">
                      {f.email ?? ""}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="profile__btn--secondary flex items-center gap-2 border rounded-lg px-3 py-2 shrink-0 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setRemoveTarget(f);
                  }}
                >
                  <UserX size={18} />
                  {t(locale, "remove")}
                </button>
              </div>
            </div>
          ))}

          {friends.length === 0 && (
            <p className="profile__muted">{t(locale, "noResult")}</p>
          )}
        </div>
      </section>

      <FriendProfileModal
        open={profileOpen}
        viewer={user}
        friendUid={profileUid}
        locale={locale}
        onClose={() => {
          setProfileOpen(false);
          setProfileUid(null);
        }}
      />

      <MessageModal
        open={!!removeTarget}
        title={t(locale, "removeFriend")}
        message={t(locale, "removeFriendConfirm")}
        background="red"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={async () => {
          if (!removeTarget) return;
          await removeFriend(removeTarget);
          setRemoveTarget(null);
        }}
      />
    </>
  );
}
