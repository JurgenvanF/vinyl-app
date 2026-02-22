"use client";

import { useState, FormEvent, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
import LanguageToggle from "./components/language/LanguageToggle";

type FormType = "login" | "register";

export default function AuthPage() {
  const { locale } = useLanguage();
  const router = useRouter();

  const [formType, setFormType] = useState<FormType>("login");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Common form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register only
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.replace("/dashboard"); // redirect to dashboard immediately
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (error: unknown) {
      alert(t(locale, "signInError"));
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        firstName,
        lastName,
        username,
        email,
        createdAt: new Date(),
      });

      router.replace("/dashboard");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  if (loading)
    return <p className="text-center mt-20">{t(locale, "loading")}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <LanguageToggle />

      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-md max-w-md w-full mt-10">
        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setFormType("login")}
            className={`px-6 py-2 rounded-full ${formType === "login" ? "bg-black text-white" : "border border-black dark:border-white dark:text-zinc-50"}`}
          >
            {t(locale, "login")}
          </button>
          <button
            onClick={() => setFormType("register")}
            className={`px-6 py-2 rounded-full ${formType === "register" ? "bg-black text-white" : "border border-black dark:border-white dark:text-zinc-50"}`}
          >
            {t(locale, "register")}
          </button>
        </div>

        {formType === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder={t(locale, "email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <input
              type="password"
              placeholder={t(locale, "password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <button
              type="submit"
              className="p-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
            >
              {t(locale, "login")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t(locale, "firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <input
              type="text"
              placeholder={t(locale, "lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <input
              type="text"
              placeholder={t(locale, "username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <input
              type="email"
              placeholder={t(locale, "email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <input
              type="password"
              placeholder={t(locale, "password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
            />
            <button
              type="submit"
              className="p-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
            >
              {t(locale, "signUp")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
