<template>
  <section v-if="percentiles" class="relative not-prose scroll-mt-[72px]">
    <div class="absolute inset-0 pointer-events-none -z-[1]" aria-hidden="true">
      <div class="absolute inset-0"></div>
    </div>
    <div class="relative px-4 md:px-6 pb-8 md:pb-12 lg:pb-16 text-default max-w-6xl mx-auto">
      <div class="mb-8 md:mx-auto md:mb-12 text-center max-w-3xl">
        <h2 class="font-bold leading-tighter tracking-tighter font-heading text-heading text-3xl md:text-4xl">Percentily</h2>
      </div>
      <div class="flex flex-wrap justify-center -m-4 text-center">
        <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
          <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{{ percentiles.socializer }}</div>
          <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base">Společník</div>
        </div>
        <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
          <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{{ percentiles.explorer }}</div>
          <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base">Dobrodruh</div>
        </div>
        <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
          <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{{ percentiles.killer }}</div>
          <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base">Bojovník</div>
        </div>
        <div class="p-4 md:w-1/4 sm:w-1/2 w-full min-w-[220px] text-center md:border-r md:last:border-none dark:md:border-slate-500">
          <div class="font-heading text-primary text-[2.6rem] font-bold dark:text-white lg:text-5xl xl:text-6xl">{{ percentiles.achiever }}</div>
          <div class="text-sm font-medium uppercase tracking-widest text-gray-800 dark:text-slate-400 lg:text-base">Kolektor</div>
        </div>
      </div>
      <p class="text-muted text-center mt-8">
        Percentil vyjadřuje, jak vysoko se nacházíte v porovnání s ostatními hráči. Pokud máte například percentil {{ percentiles.socializer }} u Společníka, znamená to, že je u vás rys Společníka vyšší, než u {{ percentiles.socializer }}ti procent dalších hráčů.
      </p>
    </div>
  </section>
</template>

<script>
import parseBartleParams from '../../utils/parseBartleParams';

export default {
  data() {
    return {
      percentiles: {
        socializer: -1,
        killer: -1,
        achiever: -1,
        explorer: -1
      }
    };
  },
  mounted() {
    this.percentiles = parseBartleParams();
  }
};
</script>