'use client';

import { getAllCompanions } from "@/lib/actions/companion.actions";

const ComponentsLibrary = async ({searchParams}:SearchParams) =>{
    const filters= await searchParams;
    const subject = filters.subject ? filters.subject: '';
    const topic = filters.topic ? filters.topic

    const companions = await getAllCompanions({subject, topic});

    return (
        <div>Companions</div>
    )
}
export default ComponentsLibrary