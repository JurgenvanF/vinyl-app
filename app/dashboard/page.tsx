"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type UserProfile = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Could not load your profile. Please try again.";
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile({
            firstName: currentUser.email?.split("@")[0] ?? "User",
            lastName: "",
            username: currentUser.email?.split("@")[0] ?? "",
            email: currentUser.email ?? "",
          });
        }

        setErrorMessage("");
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) return <p>Loading...</p>;

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">{errorMessage}</p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  if (!user || !profile) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Hello {profile.firstName} {profile.lastName}!
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Your username: {profile.username}
      </p>
      <button
        onClick={handleLogout}
        className="px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
