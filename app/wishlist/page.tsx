import type { Metadata } from "next";
import WishlistPageClient from "./WishlistPageClient";

export const metadata: Metadata = {
  title: "Vinyl Vault | Wishlist",
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
