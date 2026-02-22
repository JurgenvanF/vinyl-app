"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col items-center justify-center gap-6 bg-white dark:bg-black p-12 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          Welcome
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Please login or register to continue
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 rounded-full border border-black text-black hover:bg-zinc-200 transition-colors dark:border-white dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Register
          </button>
        </div>
      </main>
    </div>
  );
}
