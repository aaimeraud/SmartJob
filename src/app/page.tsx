import { AuthPanel } from "@/components/auth-panel";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-950">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
            Smart Job
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Trouvez le poste qui vous ressemble.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Une plateforme simple pour connecter les talents et les recruteurs.
            Créez votre compte pour commencer.
          </p>
        </section>
        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <AuthPanel />
        </div>
      </div>
    </main>
  );
}
