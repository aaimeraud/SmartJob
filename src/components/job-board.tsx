"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  contractTypeSchema,
  createJobOfferSchema,
  type CreateJobOfferInput,
} from "@/lib/job-offer-schema";

type JobOffer = CreateJobOfferInput & {
  id: string;
  recruiterId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CurrentUser = {
  id: string;
  name: string;
  role: "candidate" | "recruiter" | "admin";
};

const contractLabels: Record<z.infer<typeof contractTypeSchema>, string> = {
  full_time: "CDI / temps plein",
  part_time: "Temps partiel",
  contract: "CDD / contrat",
  internship: "Stage",
  apprenticeship: "Alternance",
  freelance: "Freelance",
};

const formDefaults: CreateJobOfferInput = {
  title: "",
  description: "",
  location: "",
  contractType: "full_time",
  salaryMin: null,
  salaryMax: null,
  skills: [],
  status: "draft",
};

export function JobBoard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [ownOffers, setOwnOffers] = useState<JobOffer[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadOffers() {
    const response = await fetch("/api/jobs");
    if (!response.ok) throw new Error("Impossible de charger les offres.");
    const data = (await response.json()) as { offers: JobOffer[] };
    setOffers(data.offers);
  }

  async function loadSession() {
    const response = await fetch("/api/me");
    if (!response.ok) return null;
    const data = (await response.json()) as { user: CurrentUser };
    return data.user;
  }

  useEffect(() => {
    void Promise.all([loadSession(), loadOffers()])
      .then(async ([currentUser]) => {
        setUser(currentUser);
        if (currentUser?.role === "recruiter") {
          const response = await fetch("/api/jobs?mine=true");
          if (response.ok) {
            const data = (await response.json()) as { offers: JobOffer[] };
            setOwnOffers(data.offers);
          }
        }
      })
      .catch(() => setMessage("Impossible de charger les offres."))
      .finally(() => setIsLoading(false));
  }, []);

  async function refresh() {
    await loadOffers();
    if (user?.role === "recruiter") {
      const response = await fetch("/api/jobs?mine=true");
      if (response.ok) {
        const data = (await response.json()) as { offers: JobOffer[] };
        setOwnOffers(data.offers);
      }
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Chargement des offres...</p>;
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Opportunités
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">
          Les dernières offres publiées
        </h2>
      </div>

      {offers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">
          Aucune offre publiée pour le moment.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {offer.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {offer.location} · {contractLabels[offer.contractType]}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  Publiée
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {offer.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {offer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {user?.role === "recruiter" && (
        <RecruiterOfferManager
          offers={ownOffers}
          onRefresh={refresh}
          onMessage={setMessage}
        />
      )}
      {message && (
        <p role="status" className="text-sm text-slate-600">
          {message}
        </p>
      )}
    </section>
  );
}

function RecruiterOfferManager({
  offers,
  onRefresh,
  onMessage,
}: {
  offers: JobOffer[];
  onRefresh: () => Promise<void>;
  onMessage: (message: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const form = useForm<CreateJobOfferInput>({
    resolver: zodResolver(createJobOfferSchema),
    defaultValues: formDefaults,
  });

  async function onSubmit(values: CreateJobOfferInput) {
    onMessage("");
    const response = await fetch(editingId ? `/api/jobs/${editingId}` : "/api/jobs", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      onMessage("Impossible de créer cette offre.");
      return;
    }
    form.reset(formDefaults);
    setEditingId(null);
    await onRefresh();
    onMessage(editingId ? "Offre modifiée." : "Offre enregistrée.");
  }

  function editOffer(offer: JobOffer) {
    setEditingId(offer.id);
    form.reset(offer);
  }

  function cancelEdit() {
    setEditingId(null);
    form.reset(formDefaults);
  }

  async function removeOffer(id: string) {
    const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!response.ok) {
      onMessage("Impossible de supprimer cette offre.");
      return;
    }
    await onRefresh();
    onMessage("Offre supprimée.");
  }

  return (
    <div className="rounded-2xl bg-slate-950 p-6 text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Espace recruteur
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Créer une offre</h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-5 grid gap-4 md:grid-cols-2"
      >
        <input
          {...form.register("title")}
          placeholder="Titre du poste"
          className="rounded-xl px-3 py-3 text-slate-950 md:col-span-2"
        />
        <textarea
          {...form.register("description")}
          placeholder="Description du poste"
          rows={4}
          className="rounded-xl px-3 py-3 text-slate-950 md:col-span-2"
        />
        <input
          {...form.register("location")}
          placeholder="Localisation"
          className="rounded-xl px-3 py-3 text-slate-950"
        />
        <select
          {...form.register("contractType")}
          className="rounded-xl px-3 py-3 text-slate-950"
        >
          {Object.entries(contractLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Salaire minimum (€)"
          {...form.register("salaryMin", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className="rounded-xl px-3 py-3 text-slate-950"
        />
        <input
          type="number"
          placeholder="Salaire maximum (€)"
          {...form.register("salaryMax", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className="rounded-xl px-3 py-3 text-slate-950"
        />
        <input
          placeholder="Compétences séparées par des virgules"
          className="rounded-xl px-3 py-3 text-slate-950 md:col-span-2"
          onChange={(event) =>
            form.setValue(
              "skills",
              event.target.value
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean),
            )
          }
        />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" {...form.register("status", {
            setValueAs: (value) => (value ? "published" : "draft"),
          })} />
          Publier immédiatement
        </label>
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="rounded-xl bg-indigo-500 px-4 py-3 font-medium transition hover:bg-indigo-400 disabled:opacity-50 md:col-span-2"
        >
          {form.formState.isSubmitting ? "Enregistrement..." : "Créer l’offre"}
        </button>
      </form>
      {offers.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="font-semibold">Mes offres</h3>
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-white/10 p-3"
            >
              <span>
                {offer.title} · {offer.status === "published" ? "publiée" : "brouillon"}
              </span>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => editOffer(offer)}
                  className="text-indigo-300 hover:text-indigo-200"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => void removeOffer(offer.id)}
                  className="text-rose-300 hover:text-rose-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingId && (
        <button
          type="button"
          onClick={cancelEdit}
          className="mt-4 text-sm text-slate-300 underline"
        >
          Annuler la modification
        </button>
      )}
    </div>
  );
}
