"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import LogoutButton from "../components/auth/LogOut";

type UserProfile = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

export default function Dashboard() {
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return t(locale, "profileLoadError");
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        router.replace("/");
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
  }, [router, locale]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">{errorMessage}</p>
        <LogoutButton />
      </div>
    );
  }

  if (!user || !profile)
    return <p className="text-center mt-20">{t(locale, "loading")}</p>;

  return (
    <div className="collection__container flex flex-col items-center min-h-screen gap-4 mt-20">
      <h1 className="text-2xl font-semibold">
        {t(locale, "helloName", `${profile.firstName} ${profile.lastName}`)}
      </h1>
    </div>
  );
}
