
import CompanionCard from "@/components/CompanionCard";
import { getAllCompanions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import SearchInput from "./SearchInput";
import SubjectFilter from "./SubjectFilter";

const ComponentsLibrary = async ({searchParams}:SearchParams) =>{
    const filters= await searchParams;
    const subject = filters.subject ? filters.subject: '';
    const topic = filters.topic ? filters.topic:'';

    const companions = await getAllCompanions({subject, topic});

    console.log(companions);

    return (
        <main>
            <section className="flex justify-between gap-4 max-sm: flex-col">
                <h1>Companion Library</h1>
                <div className="flex gap-4">
                    <SearchInput />
                    <SubjectFilter />
                </div>
            </section>
            <section className="companions-grind">
                {companions.map((companion)=>(
                    <CompanionCard   
                        key={companion.id}
                        {...companion}
                        color={getSubjectColor(companion.subject)}
                    />
                ))}
            </section>
        </main>
    )
}
export default ComponentsLibrary