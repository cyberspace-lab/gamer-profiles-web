import React, {useEffect, useState} from 'react';

export default function BartlePercentilesComponent(){

    const [percentiles, setPercentiles] = useState({
        socializer: -1,
        killer: -1,
        achiever: -1,
        explorer: -1}
    );
    
    useEffect(() => {
        function getURLPercentiles() {
            const params = new URLSearchParams(window.location.search);
            let searchParams = ['soc', 'kil', 'ach', 'exp'];
            const values = [];
            for(let i = 0; i < searchParams.length; i++) {
                const val = parseInt(params.get(`${searchParams[i]}`));
                if (!isNaN(val) && val >= 0 && val <= 100) {
                    values.push(val);
                } else {
                    // If parameter is missing or not within range, set default value
                    values.push(-1);
                }
            }
            return values;
        }
        const [soc, kil, ach, exp] = getURLPercentiles();
        let newPercentiles = {socializer: soc, killer:kil, achiever: ach, explorer: exp};
        setPercentiles(newPercentiles);
    }, []);

    if(!percentiles){
        return null;
    }
    return(
        <section class="relative not-prose scroll-mt-[72px]">
            <div class="absolute inset-0 pointer-events-none -z-[1]" aria-hidden="true" >
                <div class="absolute inset-0"></div>
            </div>
            <div class="relative px-4 md:px-6 py-12 md:py-16 lg:py-20 text-default max-w-6xl mx-auto">
                <div class="mb-8 md:mx-auto md:mb-12 text-center max-w-3xl">
                    <h2 class="font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl">Percentiles</h2>
                </div>
                <div class="flex flex-wrap justify-center -m-4 text-center">
                <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
                    <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{percentiles.socializer}</div>
                <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base" > Socializer </div>
                </div>
                <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
                    <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{percentiles.explorer}</div>
                <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base" > Explorer </div>
                </div>
                <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
                    <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{percentiles.killer}</div>
                <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base" > Killer </div>
                </div>
                <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
                    <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{percentiles.achiever}</div>
                <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base" > Achiever </div>
                </div>
                </div>
            </div>
        </section>
    )
}