import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import { getAllCompanions, getRecentSessions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";

// Define types for companions (optional but TS safe)
interface Companion {
  id: string;
  name: string;
  subject?: string; // subject may be undefined
  [key: string]: any; // for other props
}

const Page = async () => {
  // Fetch data
  const companions: Companion[] = await getAllCompanions({ limit: 3 });
  const recentSessionsCompanions: Companion[] = await getRecentSessions(10);

  return (
    <main className="px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Popular Companions</h1>

      {/* Popular Companions Section */}
      <section className="home-section grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-10">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={companion.subject ? getSubjectColor(companion.subject) : "#888"} // fallback color
          />
        ))}
      </section>

      {/* Recently Completed Sessions Section */}
      <section className="home-section flex flex-col md:flex-row gap-6">
        <CompanionsList
          title="Recently Completed Sessions"
          companions={recentSessionsCompanions}
          className="w-full md:w-2/3"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
