import type { Metadata } from "next";
import CollectionPageClient from "./CollectionPageClient";

export const metadata: Metadata = {
  title: "Vinyl Vault | My Collection",
};

export default function CollectionPage() {
  return <CollectionPageClient />;
}
