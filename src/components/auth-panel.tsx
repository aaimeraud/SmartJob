"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authFormSchema, signUpSchema } from "@/lib/auth-schema";
import type { z } from "zod";

type AuthFormValues = z.input<typeof authFormSchema>;
type Mode = "sign-in" | "sign-up";

type CurrentUser = {
  name: string;
  email: string;
  role: string;
};

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("sign-up");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    void fetch("/api/me")
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { user: CurrentUser };
        return data.user;
      })
      .then(setUser)
      .catch(() => setMessage("Impossible de vérifier la session."))
      .finally(() => setIsLoading(false));
  }, []);

  async function onSubmit(values: AuthFormValues) {
    setMessage("");
    const endpoint =
      mode === "sign-up"
        ? "/api/auth/sign-up/email"
        : "/api/auth/sign-in/email";
    const payload =
      mode === "sign-up"
        ? {
            name: values.name ?? "",
            email: values.email,
            password: values.password,
          }
        : { email: values.email, password: values.password };

    if (mode === "sign-up") {
      const parsed = signUpSchema.safeParse(payload);
      if (!parsed.success) {
        form.setError("name", {
          message: parsed.error.issues[0]?.message ?? "Nom invalide",
        });
        return;
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      message?: string;
      user?: CurrentUser;
    };

    if (!response.ok) {
      setMessage(data.message ?? "La demande a échoué.");
      return;
    }

    setUser(data.user ?? null);
    setMessage(
      mode === "sign-up"
        ? "Compte créé. Bienvenue sur Smart Job."
        : "Connexion réussie.",
    );
    form.reset();
  }

  async function signOut() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setMessage("Vous êtes déconnecté.");
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Chargement de la session...</p>;
  }

  if (user) {
    return (
      <section className="space-y-5">
        <div>
          <p className="text-sm text-slate-500">Session active</p>
          <h2 className="text-2xl font-semibold text-slate-950">{user.name}</h2>
          <p className="text-slate-600">{user.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            {user.role}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
        >
          Se déconnecter
        </button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        {(["sign-up", "sign-in"] as const).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => {
              setMode(nextMode);
              setMessage("");
              form.reset();
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === nextMode
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {nextMode === "sign-up" ? "Créer un compte" : "Se connecter"}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === "sign-up" && (
          <label className="block text-sm font-medium text-slate-700">
            Nom
            <input
              {...form.register("name")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500"
              placeholder="Ada Lovelace"
            />
            {form.formState.errors.name && (
              <span className="mt-1 block text-xs text-rose-600">
                {form.formState.errors.name.message}
              </span>
            )}
          </label>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            {...form.register("email")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500"
            placeholder="vous@example.com"
          />
          {form.formState.errors.email && (
            <span className="mt-1 block text-xs text-rose-600">
              {form.formState.errors.email.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Mot de passe
          <input
            type="password"
            {...form.register("password")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500"
            placeholder="8 caractères minimum"
          />
          {form.formState.errors.password && (
            <span className="mt-1 block text-xs text-rose-600">
              {form.formState.errors.password.message}
            </span>
          )}
        </label>
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {form.formState.isSubmitting
            ? "En cours..."
            : mode === "sign-up"
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
      </form>
      {message && (
        <p role="status" className="text-sm text-slate-600">
          {message}
        </p>
      )}
    </section>
  );
}
