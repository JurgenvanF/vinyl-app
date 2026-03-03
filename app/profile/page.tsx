import type { Metadata } from "next";
import ProfilePage from "../components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Vinyl Vault | Profile",
};

export default function Page() {
  return <ProfilePage />;
}

