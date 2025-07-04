'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const SearchInput = () =>{
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get(name:'topic') ||'';

    return(
        <div>SearchInput</div>
    )
}
export default SearchInput;