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

import { Disc3 } from "lucide-react";

type FormType = "login" | "register";

export default function AuthPage() {
  const { locale, toggleLocale } = useLanguage();
  const router = useRouter();

  const [formType, setFormType] = useState<FormType>("login");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Common form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-only states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.replace("/collection");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Reset all form fields when switching forms
  const switchForm = (type: FormType) => {
    setFormType(type);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/collection");
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
        email,
        createdAt: new Date(),
      });

      router.replace("/collection");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="auth__title flex items-center gap-4 mb-2">
          <Disc3 size={50} />
          <h1 className="text-4xl">Vinyl Vault</h1>
        </div>
        <p className="mt-2 w-7/10">{t(locale, "welcomeDescription")}</p>
      </div>
      <div className="auth__container p-8 rounded-lg shadow-md max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 mb-6">
          <div>
            <p className="font-semibold">{t(locale, "welcome")}</p>
            <p>{t(locale, "signInInstructions")}</p>
          </div>

          <div
            className="auth__container__language flex items-center px-4 py-2 rounded-xl border transition-colors cursor-pointer"
            onClick={toggleLocale}
          >
            <LanguageToggle />
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="auth__container__buttons flex justify-center gap-4 mx-auto mb-6 p-2 rounded-full">
          <button
            onClick={() => switchForm("login")}
            className={`px-6 py-2 rounded-full ${
              formType === "login"
                ? "auth__container__buttons__active w-1/2"
                : "w-1/2 cursor-pointer"
            }`}
          >
            {t(locale, "login")}
          </button>
          <button
            onClick={() => switchForm("register")}
            className={`px-6 py-2 rounded-full ${
              formType === "register"
                ? "auth__container__buttons__active w-1/2"
                : "w-1/2 cursor-pointer"
            }`}
          >
            {t(locale, "register")}
          </button>
        </div>

        {/* Forms */}
        {formType === "login" ? (
          <form
            key="login"
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t(locale, "email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-transparent rounded-md transition-all duration-200 ease-in-out"
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder={t(locale, "password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-transparent rounded-md transition-all duration-200 ease-in-out"
            />
            <button
              type="submit"
              className="auth__container__submit p-3 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {t(locale, "login")}
            </button>
          </form>
        ) : (
          <form
            key="register"
            onSubmit={handleRegister}
            className="flex flex-col gap-4"
          >
            <input
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder={t(locale, "firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="p-3 border border-transparent rounded-md transition-all duration-200 ease-in-out"
            />
            <input
              type="text"
              name="lastName"
              autoComplete="family-name"
              placeholder={t(locale, "lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="p-3 border border-transparent rounded-md transition-all duration-200 ease-in-out"
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t(locale, "email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-transparent rounded-md transition-all duration-200 ease-in-out"
            />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder={t(locale, "password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-transparent rounded-md transition-all duration-200 ease-in-out"
            />
            <button
              type="submit"
              className="auth__container__submit p-3 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {t(locale, "signUp")}
            </button>
          </form>
        )}
      </div>
      <div className="auth__container__footer flex flex-col text-center justify-center mt-4">
        <p>{t(locale, "welcomeFooter")}</p>
        <p className="text-center mt-2">
          {t(locale, "productBy")}{" "}
          <a
            href="https://www.jurgenvanfraeijenhove.nl"
            target="_blank"
            className="underline"
          >
            Jurgen van Fraeijenhove
          </a>
        </p>
      </div>
    </div>
  );
}
