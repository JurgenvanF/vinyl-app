"use client";

import { useState, FormEvent } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import LanguageToggle from "../components/language/LanguageToggle";

export default function Login() {
  const { locale } = useLanguage();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: unknown) {
      alert(t(locale, "signInError"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <LanguageToggle />

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-8 rounded-lg shadow-md bg-white dark:bg-black max-w-md mx-auto mt-10"
      >
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {t(locale, "login")}
        </h1>

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
    </div>
  );
}
