export type ProfilePrivacyLevel = "everyone" | "friends" | "me";

export type ProfilePrivacySettings = {
  profile: ProfilePrivacyLevel;
  collection: ProfilePrivacyLevel;
  wishlist: ProfilePrivacyLevel;
};

export type UserProfileDocument = {
  firstName: string;
  lastName: string;
  email: string;

  bio?: string;
  startedCollectingYear?: number | null;
  favoriteAlbumId?: number | null;
  favoriteGenres?: string[];

  privacy?: Partial<ProfilePrivacySettings>;

  // Search helpers
  emailLower?: string;
  firstNameLower?: string;
  lastNameLower?: string;
  fullNameLower?: string;

  updatedAt?: unknown;
};

export type CollectionAlbumLite = {
  id: number;
  title: string;
  artist?: string;
  primaryArtist?: string;
  cover_image?: string;
  genre?: string[] | null;
  year?: number | null;
};

export type FriendEntry = {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  addedAt?: unknown;
};

export type FriendRequestEntry = {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: unknown;
};
