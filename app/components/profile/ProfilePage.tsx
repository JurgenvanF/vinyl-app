"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../../lib/firebase";
import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";
import VinylSpinner from "../spinner/VinylSpinner";

import ProfileTabs, { ProfileTabKey } from "./ProfileTabs";
import ProfilePersonalInfoPanel from "./panels/ProfilePersonalInfoPanel";
import ProfileStatsFavoritesPanel from "./panels/ProfileStatsFavoritesPanel";
import ProfilePrivacyPanel from "./panels/ProfilePrivacyPanel";
import ProfileFriendsPanel from "./panels/ProfileFriendsPanel";
import type {
  CollectionAlbumLite,
  ProfilePrivacySettings,
  UserProfileDocument,
} from "./profileTypes";

import "./ProfilePage.scss";
import { X } from "lucide-react";
import { normalizeProfileIconColor } from "./profileDisplay";

const defaultPrivacy: ProfilePrivacySettings = {
  profile: "everyone",
  collection: "friends",
  wishlist: "friends",
};

function normalizeProfileDoc(
  raw: unknown,
  fallbackEmail: string,
): UserProfileDocument {
  const base =
    typeof raw === "object" && raw ? (raw as Record<string, unknown>) : {};
  const firstName =
    typeof base.firstName === "string"
      ? base.firstName
      : (fallbackEmail.split("@")[0] ?? "User");
  const lastName = typeof base.lastName === "string" ? base.lastName : "";
  const email = typeof base.email === "string" ? base.email : fallbackEmail;

  const bio = typeof base.bio === "string" ? base.bio : "";
  const startedCollectingYear =
    typeof base.startedCollectingYear === "number"
      ? base.startedCollectingYear
      : null;
  const favoriteAlbumId =
    typeof base.favoriteAlbumId === "number" ? base.favoriteAlbumId : null;
  const favoriteGenres = Array.isArray(base.favoriteGenres)
    ? base.favoriteGenres
        .filter((g): g is string => typeof g === "string")
        .map((g) => g.trim())
        .filter(Boolean)
    : [];
  const iconColor = normalizeProfileIconColor(base.iconColor);

  const privacyRaw =
    typeof base.privacy === "object" && base.privacy
      ? (base.privacy as Record<string, unknown>)
      : {};
  const privacy: Partial<ProfilePrivacySettings> = {
    profile:
      privacyRaw.profile === "everyone" ||
      privacyRaw.profile === "friends" ||
      privacyRaw.profile === "me"
        ? (privacyRaw.profile as ProfilePrivacySettings["profile"])
        : undefined,
    collection:
      privacyRaw.collection === "everyone" ||
      privacyRaw.collection === "friends" ||
      privacyRaw.collection === "me"
        ? (privacyRaw.collection as ProfilePrivacySettings["collection"])
        : undefined,
    wishlist:
      privacyRaw.wishlist === "everyone" ||
      privacyRaw.wishlist === "friends" ||
      privacyRaw.wishlist === "me"
        ? (privacyRaw.wishlist as ProfilePrivacySettings["wishlist"])
        : undefined,
  };

  return {
    firstName,
    lastName,
    email,
    bio,
    startedCollectingYear,
    favoriteAlbumId,
    favoriteGenres,
    iconColor,
    privacy,
  };
}

function toSearchFields(profile: UserProfileDocument) {
  const emailLower = (profile.email ?? "").trim().toLowerCase();
  const firstNameLower = (profile.firstName ?? "").trim().toLowerCase();
  const lastNameLower = (profile.lastName ?? "").trim().toLowerCase();
  const fullNameLower = `${firstNameLower} ${lastNameLower}`
    .replace(/\s+/g, " ")
    .trim();
  return { emailLower, firstNameLower, lastNameLower, fullNameLower };
}

export default function ProfilePage() {
  const { locale } = useLanguage();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileDocument | null>(null);
  const [draft, setDraft] = useState<UserProfileDocument | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("profile");

  const [collectionAlbums, setCollectionAlbums] = useState<
    CollectionAlbumLite[]
  >([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [incomingRequestsCount, setIncomingRequestsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setDraft(null);
        setEditMode(false);
        setLoading(false);
        setCollectionAlbums([]);
        setCollectionLoading(false);
        router.replace("/");
        return;
      }

      setUser(currentUser);
      setCollectionLoading(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const raw = snap.data() as Record<string, unknown> | undefined;
        const next = normalizeProfileDoc(raw, user.email ?? "");
        setProfile(next);
        setDraft((prev) => (prev ? prev : next));

        if (raw) {
          const updates: Record<string, unknown> = {};

          // Backfill search helpers for forgiving friend search
          const search = toSearchFields(next);
          if (raw.emailLower !== search.emailLower)
            updates.emailLower = search.emailLower;
          if (raw.firstNameLower !== search.firstNameLower)
            updates.firstNameLower = search.firstNameLower;
          if (raw.lastNameLower !== search.lastNameLower)
            updates.lastNameLower = search.lastNameLower;
          if (raw.fullNameLower !== search.fullNameLower)
            updates.fullNameLower = search.fullNameLower;
          if (raw.iconColor !== next.iconColor)
            updates.iconColor = next.iconColor;

          // Backfill privacy defaults
          const rawPrivacy =
            typeof raw.privacy === "object" && raw.privacy
              ? (raw.privacy as Record<string, unknown>)
              : {};
          const mergedPrivacy: ProfilePrivacySettings = {
            ...defaultPrivacy,
            ...(rawPrivacy as Partial<ProfilePrivacySettings>),
          };
          const missingPrivacyKeys =
            rawPrivacy.profile === undefined ||
            rawPrivacy.collection === undefined ||
            rawPrivacy.wishlist === undefined;
          if (missingPrivacyKeys) updates.privacy = mergedPrivacy;

          if (Object.keys(updates).length > 0) {
            void setDoc(ref, updates, { merge: true });
          }
        }
      },
      async () => {
        // fallback to a one-time fetch so we can still render something
        try {
          const snap = await getDoc(ref);
          const raw = snap.data() as Record<string, unknown> | undefined;
          const next = normalizeProfileDoc(raw, user.email ?? "");
          setProfile(next);
          setDraft((prev) => (prev ? prev : next));
        } catch {
          setProfile(null);
          setDraft(null);
        }
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "FriendRequestsIncoming");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => setIncomingRequestsCount(snap.size),
      () => setIncomingRequestsCount(0),
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const collectionRef = collection(db, "users", user.uid, "Collection");
    const q = query(collectionRef, orderBy("addedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const albumsData: CollectionAlbumLite[] = snapshot.docs
          .map((docSnap): CollectionAlbumLite | null => {
            const data = docSnap.data() as Record<string, unknown>;
            const id =
              typeof data.id === "number" ? data.id : Number(docSnap.id);
            if (!Number.isFinite(id)) return null;

            const genre = Array.isArray(data.genre)
              ? data.genre.filter((v): v is string => typeof v === "string")
              : data.genre && typeof data.genre === "string"
                ? [data.genre]
                : null;

            return {
              id,
              title: typeof data.title === "string" ? data.title : "",
              artist: typeof data.artist === "string" ? data.artist : undefined,
              primaryArtist:
                typeof data.primaryArtist === "string"
                  ? data.primaryArtist
                  : undefined,
              cover_image:
                typeof data.cover_image === "string"
                  ? data.cover_image
                  : undefined,
              genre,
              year: typeof data.year === "number" ? data.year : null,
            };
          })
          .filter((album): album is CollectionAlbumLite => album !== null);

        setCollectionAlbums(albumsData);
        setCollectionLoading(false);
      },
      () => {
        setCollectionAlbums([]);
        setCollectionLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const uniqueGenres = useMemo(() => {
    const all = new Set<string>();
    for (const album of collectionAlbums) {
      if (!Array.isArray(album.genre)) continue;
      for (const g of album.genre) {
        const normalized = g.trim();
        if (normalized) all.add(normalized);
      }
    }
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [collectionAlbums]);

  const tabLabels = {
    profile: t(locale, "profile"),
    privacy: t(locale, "privacy"),
    friends: t(locale, "friends"),
  } satisfies Record<ProfileTabKey, string>;

  const canRender = !loading && user && profile && draft;

  const onCancelEdit = () => {
    if (!profile) return;
    setDraft(profile);
    setEmailError(null);
    setEditMode(false);
  };

  const onSaveProfile = async () => {
    if (!user || !draft || saving) return;
    setEmailError(null);

    const trimmedEmail = (draft.email ?? "").trim();
    const isLikelyValidEmail = (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!isLikelyValidEmail(trimmedEmail)) {
      setEmailError(t(locale, "invalidEmail"));
      return;
    }

    const ref = doc(db, "users", user.uid);

    const safeFavoriteGenres = Array.isArray(draft.favoriteGenres)
      ? draft.favoriteGenres.slice(0, 5)
      : [];

    setSaving(true);
    try {
      const emailLower = trimmedEmail.toLowerCase();
      const usersRef = collection(db, "users");
      const [lowerSnap, exactSnap] = await Promise.all([
        getDocs(query(usersRef, where("emailLower", "==", emailLower), limit(3))),
        getDocs(query(usersRef, where("email", "==", trimmedEmail), limit(3))),
      ]);

      const otherUserHasEmail =
        lowerSnap.docs.some((docSnap) => docSnap.id !== user.uid) ||
        exactSnap.docs.some((docSnap) => docSnap.id !== user.uid);

      if (otherUserHasEmail) {
        setEmailError(t(locale, "emailAlreadyInUse"));
        return;
      }

      const searchFields = toSearchFields({ ...draft, email: trimmedEmail });
      const safeIconColor = normalizeProfileIconColor(draft.iconColor);
      const payload: Partial<UserProfileDocument> = {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        email: trimmedEmail,
        bio: (draft.bio ?? "").trim(),
        startedCollectingYear:
          typeof draft.startedCollectingYear === "number"
            ? draft.startedCollectingYear
            : null,
        favoriteAlbumId:
          typeof draft.favoriteAlbumId === "number"
            ? draft.favoriteAlbumId
            : null,
        favoriteGenres: safeFavoriteGenres,
        iconColor: safeIconColor,
        ...searchFields,
        updatedAt: serverTimestamp() as unknown as never,
      };

      await setDoc(ref, payload, { merge: true });
      const [friendsSnap, outgoingSnap, incomingSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "Friends")),
        getDocs(collection(db, "users", user.uid, "FriendRequestsOutgoing")),
        getDocs(collection(db, "users", user.uid, "FriendRequestsIncoming")),
      ]);

      const mirrorPayload = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        iconColor: safeIconColor,
      };

      await Promise.all([
        ...friendsSnap.docs.map((friendDoc) =>
          setDoc(
            doc(db, "users", friendDoc.id, "Friends", user.uid),
            mirrorPayload,
            { merge: true },
          ),
        ),
        ...outgoingSnap.docs.map((requestDoc) =>
          setDoc(
            doc(db, "users", requestDoc.id, "FriendRequestsIncoming", user.uid),
            mirrorPayload,
            { merge: true },
          ),
        ),
        ...incomingSnap.docs.map((requestDoc) =>
          setDoc(
            doc(db, "users", requestDoc.id, "FriendRequestsOutgoing", user.uid),
            mirrorPayload,
            { merge: true },
          ),
        ),
      ]);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  if (!canRender) {
    return (
      <div className="min-h-full flex items-center justify-center mt-10">
        <VinylSpinner />
      </div>
    );
  }

  const currentUser = user as User;

  const showEditActions = activeTab === "profile";

  return (
    <div className="min-h-full flex flex-col gap-4 max-w-[1000px] mx-auto w-full">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex justify-between w-full">
          <h1 className="text-4xl sm:text-5xl mb-2">{t(locale, "profile")}</h1>

          {showEditActions && (
            <div className="flex items-center gap-2">
              {!editMode ? (
                <button
                  type="button"
                  className="profile__btn--primary border rounded-lg px-4 py-2 cursor-pointer"
                  onClick={() => setEditMode(true)}
                  disabled={saving}
                >
                  {t(locale, "editProfile")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="profile__btn--primary border rounded-lg px-4 py-2 cursor-pointer"
                    onClick={onSaveProfile}
                    disabled={saving}
                  >
                    {saving ? t(locale, "saving") : t(locale, "saveChanges")}
                  </button>
                  <button
                    type="button"
                    className="profile__btn--secondary border rounded-lg px-3 py-2 cursor-pointer"
                    onClick={onCancelEdit}
                    disabled={saving}
                    aria-label={t(locale, "cancel")}
                    title={t(locale, "cancel")}
                  >
                    <X />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <p className="profile__muted">
          {t(locale, "helloName", `${profile.firstName} ${profile.lastName}`)}
        </p>
      </div>

      <ProfileTabs
        active={activeTab}
        onChange={setActiveTab}
        labels={tabLabels}
        badges={{ friends: incomingRequestsCount }}
      />

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 gap-4 items-start">
          <ProfilePersonalInfoPanel
            locale={locale}
            user={currentUser}
            profile={profile}
            draft={draft}
            editMode={editMode}
            onDraftChange={(next) => {
              setDraft(next);
              setEmailError(null);
            }}
            emailError={emailError}
            title={t(locale, "personalInformation")}
            labels={{
              name: t(locale, "name"),
              firstName: t(locale, "firstName"),
              lastName: t(locale, "lastName"),
              email: t(locale, "email"),
              biography: t(locale, "biography"),
              iconColor: t(locale, "avatarColor"),
            }}
          />

          <ProfileStatsFavoritesPanel
            draft={draft}
            editMode={editMode}
            onDraftChange={setDraft}
            collectionAlbums={collectionAlbums}
            uniqueGenres={uniqueGenres}
            labels={{
              title: t(locale, "collectionStatsAndFavorites"),
              statsAlbums: t(locale, "albumsInCollection"),
              statsYears: t(locale, "yearsCollecting"),
              statsUniqueGenres: t(locale, "uniqueGenres"),
              statsTopArtist: t(locale, "topArtist"),
              yearStarted: t(locale, "yearStartedCollecting"),
              favoriteAlbum: t(locale, "favoriteAlbum"),
              favoriteGenres: t(locale, "favoriteGenres"),
              noFavoriteAlbumSet: t(locale, "noFavoriteAlbumSet"),
              noFavoriteGenresSet: t(locale, "noFavoriteGenresSet"),
              noneSelected: t(locale, "noneSelected"),
            }}
          />
        </div>
      )}

      {activeTab === "privacy" && (
        <ProfilePrivacyPanel
          user={currentUser}
          profile={profile}
          locale={locale}
        />
      )}

      {activeTab === "friends" && (
        <ProfileFriendsPanel user={currentUser} locale={locale} />
      )}

      {collectionLoading && (
        <p className="profile__muted text-sm">{t(locale, "loading")}</p>
      )}
    </div>
  );
}
