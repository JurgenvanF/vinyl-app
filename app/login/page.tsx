"use client";

import { useState, FormEvent } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-4 p-8 rounded-lg shadow-md bg-white dark:bg-black max-w-md mx-auto mt-20"
    >
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Login
      </h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-3 border border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
      />
      <button
        type="submit"
        className="p-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
      >
        Log In
      </button>
    </form>
  );
}
