"use client";

import { useState, FormEvent } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import LanguageToggle from "../components/language/LanguageToggle";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

export default function Register() {
  const { locale } = useLanguage();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        username,
        email,
        createdAt: new Date(),
      });

      router.replace("/dashboard");
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <LanguageToggle />

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 p-8 rounded-lg shadow-md bg-white dark:bg-black max-w-md mx-auto mt-10"
      >
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {t(locale, "register")}
        </h1>

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
    </div>
  );
}
