import PublicApplicationForm from "@/components/applications/public-application-form";

type PublicApplicationPageProps = {
  params: Promise<{ publicSlug: string }>;
};

export default async function PublicApplicationPage({ params }: PublicApplicationPageProps) {
  const { publicSlug } = await params;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <PublicApplicationForm publicSlug={publicSlug} />
    </main>
  );
}
