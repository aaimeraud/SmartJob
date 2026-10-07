"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  applicationFormSchema,
  type ApplicationFormInput,
} from "@/lib/application-schema";
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

type ApplicationSummary = {
  id: string;
  jobOfferId: string;
  cvFilename: string;
  cvMimeType: string;
  cvSize: number;
  message: string | null;
  status: "submitted" | "reviewing" | "accepted" | "rejected";
  createdAt: string;
  jobOffer: { id: string; title: string; location?: string };
  candidate?: { id: string; name: string; email: string };
};

const searchFormSchema = z.object({
  q: z.string().trim().max(160).optional(),
  location: z.string().trim().max(160).optional(),
  contractType: z.union([contractTypeSchema, z.literal("")]).optional(),
  skills: z.string().trim().max(1_800).optional(),
  minSalary: z
    .string()
    .regex(/^\d*$/, "Le salaire doit être un nombre positif.")
    .optional(),
  maxSalary: z
    .string()
    .regex(/^\d*$/, "Le salaire doit être un nombre positif.")
    .optional(),
});

type SearchFormInput = z.infer<typeof searchFormSchema>;

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadOffers(query = "") {
    const response = await fetch(`/api/jobs${query ? `?${query}` : ""}`);
    if (!response.ok) throw new Error("Impossible de charger les offres.");
    const data = (await response.json()) as {
      offers: JobOffer[];
      pagination: Pagination;
    };
    setOffers(data.offers);
    setPagination(data.pagination);
  }

  async function loadSession() {
    const response = await fetch("/api/me");
    if (!response.ok) return null;
    const data = (await response.json()) as { user: CurrentUser };
    return data.user;
  }

  useEffect(() => {
    void Promise.all([loadSession(), loadOffers(window.location.search.slice(1))])
      .then(async ([currentUser]) => {
        setUser(currentUser);
        if (currentUser?.role === "recruiter") {
          const response = await fetch("/api/jobs?mine=true");
          if (response.ok) {
            const data = (await response.json()) as { offers: JobOffer[] };
            setOwnOffers(data.offers);
          }
        }
        const applicationsResponse = await fetch("/api/applications");
        if (applicationsResponse.ok) {
          const data = (await applicationsResponse.json()) as {
            applications: ApplicationSummary[];
          };
          setApplications(data.applications);
        }
      })
      .catch(() => setMessage("Impossible de charger les offres."))
      .finally(() => setIsLoading(false));
    const handleSessionChange = () => {
      void loadSession().then(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const response = await fetch("/api/applications");
          if (response.ok) {
            const data = (await response.json()) as {
              applications: ApplicationSummary[];
            };
            setApplications(data.applications);
          }
        }
      });
    };
    window.addEventListener("smart-job:session-changed", handleSessionChange);
    return () =>
      window.removeEventListener(
        "smart-job:session-changed",
        handleSessionChange,
      );
  }, []);

  async function refresh() {
    await loadOffers(window.location.search.slice(1));
    if (user?.role === "recruiter") {
      const response = await fetch("/api/jobs?mine=true");
      if (response.ok) {
        const data = (await response.json()) as { offers: JobOffer[] };
        setOwnOffers(data.offers);
      }
    }
    const applicationsResponse = await fetch("/api/applications");
    if (applicationsResponse.ok) {
      const data = (await applicationsResponse.json()) as {
        applications: ApplicationSummary[];
      };
      setApplications(data.applications);
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

      <SearchFilters
        onSearch={(query) => {
          window.history.pushState({}, "", query ? `/?${query}` : "/");
          void loadOffers(query).catch(() =>
            setMessage("Impossible de charger les offres."),
          );
        }}
      />

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
              {user?.role === "candidate" && (
                <ApplicationForm
                  jobOfferId={offer.id}
                  existingApplication={applications.find(
                    (application) => application.jobOfferId === offer.id,
                  )}
                  onSubmitted={refresh}
                  onMessage={setMessage}
                />
              )}
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav
          aria-label="Pagination des offres"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm"
        >
          <button
            type="button"
            disabled={pagination.page === 1}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(pagination.page - 1));
              window.history.pushState({}, "", `/?${params.toString()}`);
              void loadOffers(params.toString()).catch(() =>
                setMessage("Impossible de charger les offres."),
              );
            }}
            className="rounded-lg px-3 py-2 text-indigo-700 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-slate-500">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("page", String(pagination.page + 1));
              window.history.pushState({}, "", `/?${params.toString()}`);
              void loadOffers(params.toString()).catch(() =>
                setMessage("Impossible de charger les offres."),
              );
            }}
            className="rounded-lg px-3 py-2 text-indigo-700 disabled:opacity-40"
          >
            Suivant
          </button>
        </nav>
      )}

      {user?.role === "recruiter" && (
        <RecruiterOfferManager
          offers={ownOffers}
          applications={applications}
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

function ApplicationForm({
  jobOfferId,
  existingApplication,
  onSubmitted,
  onMessage,
}: {
  jobOfferId: string;
  existingApplication?: ApplicationSummary;
  onSubmitted: () => Promise<void>;
  onMessage: (message: string) => void;
}) {
  const form = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: { message: null },
  });

  if (existingApplication) {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500">
        <span>Candidature envoyée · statut : {existingApplication.status}</span>
        <button
          type="button"
          onClick={async () => {
            const response = await fetch(
              `/api/applications/${existingApplication.id}`,
              { method: "DELETE" },
            );
            if (response.ok) {
              await onSubmitted();
              onMessage("Candidature supprimée.");
            } else {
              onMessage("Impossible de supprimer la candidature.");
            }
          }}
          className="text-rose-600 hover:text-rose-500"
        >
          Supprimer
        </button>
      </div>
    );
  }

  async function submit(values: ApplicationFormInput) {
    onMessage("");
    const data = new FormData();
    data.append("cv", values.cv);
    if (values.message) data.append("message", values.message);
    const response = await fetch(`/api/jobs/${jobOfferId}/applications`, {
      method: "POST",
      body: data,
    });
    if (!response.ok) {
      onMessage("Impossible d'envoyer la candidature.");
      return;
    }
    form.reset({ message: null });
    await onSubmitted();
    onMessage("Candidature envoyée.");
  }

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="mt-5 space-y-3 border-t border-slate-100 pt-4"
    >
      <label className="block text-sm font-medium text-slate-700">
        CV (PDF ou DOCX, 5 Mo maximum)
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              form.setValue("cv", file, { shouldValidate: true });
            }
          }}
          className="mt-1 block w-full text-sm"
        />
      </label>
      <textarea
        {...form.register("message")}
        placeholder="Message (optionnel)"
        rows={2}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      {form.formState.errors.cv && (
        <p className="text-sm text-rose-600">{form.formState.errors.cv.message}</p>
      )}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {form.formState.isSubmitting ? "Envoi..." : "Postuler"}
      </button>
    </form>
  );
}

function SearchFilters({ onSearch }: { onSearch: (query: string) => void }) {
  const form = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      q: "",
      location: "",
      contractType: undefined,
      skills: "",
      minSalary: "",
      maxSalary: "",
    },
  });

  function submit(values: SearchFormInput) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    onSearch(params.toString());
  }

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <input
        {...form.register("q")}
        placeholder="Mot-clé"
        aria-label="Mot-clé"
        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-950"
      />
      <input
        {...form.register("location")}
        placeholder="Localisation"
        aria-label="Localisation"
        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-950"
      />
      <select
        {...form.register("contractType")}
        aria-label="Type de contrat"
        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-950"
      >
        <option value="">Tous les contrats</option>
        {Object.entries(contractLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        {...form.register("skills")}
        placeholder="Compétences (séparées par des virgules)"
        aria-label="Compétences"
        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-950 md:col-span-2"
      />
      <div className="flex gap-3">
        <input
          {...form.register("minSalary")}
          inputMode="numeric"
          placeholder="Salaire min."
          aria-label="Salaire minimum"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-950"
        />
        <input
          {...form.register("maxSalary")}
          inputMode="numeric"
          placeholder="Salaire max."
          aria-label="Salaire maximum"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-950"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
      >
        Rechercher
      </button>
    </form>
  );
}

function RecruiterOfferManager({
  offers,
  applications,
  onRefresh,
  onMessage,
}: {
  offers: JobOffer[];
  applications: ApplicationSummary[];
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
      {applications.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="font-semibold">Candidatures reçues</h3>
          {applications.map((application) => (
            <div
              key={application.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 p-3 text-sm"
            >
              <span>
                {application.candidate?.name} · {application.jobOffer.title}
              </span>
              <select
                value={application.status}
                onChange={async (event) => {
                  await fetch(`/api/applications/${application.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: event.target.value }),
                  });
                  await onRefresh();
                }}
                className="rounded-lg px-2 py-1 text-slate-950"
              >
                <option value="submitted">Reçue</option>
                <option value="reviewing">En étude</option>
                <option value="accepted">Acceptée</option>
                <option value="rejected">Refusée</option>
              </select>
              <a
                href={`/api/applications/${application.id}`}
                className="text-indigo-300 hover:text-indigo-200"
              >
                Télécharger le CV
              </a>
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
