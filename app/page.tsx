import CompanionsList from "@/components/CompanionsList";
import { Button } from "../components/ui/button";
import CompanionCard from "@/components/CompanionCard";
import Cta from "@/components/CTA";
const Page = () => {
  return (
    <main>
      <h1>Popular Companions</h1>
      <section>
        <CompanionCard />
        <CompanionCard />
        <CompanionCard />
      </section>

      <section className="home-section">
        <CompanionsList/>
        <Cta/>
      </section>
      <section className="home-section">
        <CompanionsList />
        <Cta />
      </section>
    </main>
  )
}

export default Page