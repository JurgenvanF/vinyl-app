export type SaveTarget = "collection" | "wishlist";

export type CustomExtraArtist = { name: string; role: string };
export type CustomTrackDraft = { title: string; duration: string };
export type CustomLabel = { name: string };
export type LocalImage = { file: File; previewUrl: string };

export type TracklistMode = "continuous" | "sides";
export type CustomSideDraft = { side: string; tracks: CustomTrackDraft[] };

