<template>
    <section class="relative not-prose scroll-mt-[72px]">
        <div class="relative px-4 md:px-6 py-12 md:py-16 lg:py-20 text-default max-w-7xl mx-auto pt-0 md:pt-0 lg:pt-0">
            <div class="mx-auto max-w-7xl p-4 md:px-8">
                <h1 class="text-3xl font-bold leading-tighter tracking-tighter font-heading text-heading text-center mb-8 md:mb-12">
                    Váš dominantní typ je <span class="text-accent dark:text-white highlight"> {{ personality.dominantType }}</span>
                    <p><span class="text-base text-primary dark:text-blue-200"> Podtyp {{ personality.subtype }}</span></p>
                </h1>
                <div class="md:flex md:gap-16">
                    <div class="self-center">
                        <div class="mb-12 text-lg dark:text-slate-400">
                            <p class="text-muted">
                                {{ personality.typeDescription }}
                            </p>
                        </div>
                        <div class="grid mx-auto gap-8 gap-y-4 md:gap-y-8">
                            <div>
                                <div class="flex flex-row max-w-none">
                                    <div class="flex justify-center">
                                    </div>
                                    <div class="mt-0.5">
                                        <p class="mt-3 text-muted dark:text-slate-400 ml-2 rtl:ml-0 rtl:mr-2">{{ personality.subtypeDescription }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-if="dominantTypes.length > 1 || subtypes.length > 1" class="text-muted text-center mt-8">
                    Pokud jste ve více kategoriích na stejném percentilu, váš dominantní typ či subtyp je v tuto chvíli vybraný náhodně. 
                </p>
            </div>
        </div>
    </section>
</template>

<script>
import parseBartleParams from "./../../utils/parseBartleParams.js";
import types from "./../../assets/data/bartleTypes.json";
export default {
    data() {
        return {
            personality: {
                dominantType: "None",
                typeDescription: "No description available",
                subtype: "None",
                subtypeDescription: "No description available"
            },
            dominantTypes: [],
            subtypes: []
        };
    },
    mounted: async function() {
        let params = parseBartleParams();
        // find the larges value in params and return the key
        // in case there is a tie, return all keys
        this.dominantTypes = Object.keys(params).filter(key => params[key] === Math.max(...Object.values(params)));
        // remove the dominant type from the params
        let dominantType = this.dominantTypes[0];
        delete params[dominantType];
        // find the largest value in the remaining params
        this.subtypes = Object.keys(params).filter(key => params[key] === Math.max(...Object.values(params)));
        let subtype = this.subtypes[0];
        this.personality.dominantType = types[dominantType].name;
        this.personality.typeDescription = types[dominantType].description;
        this.personality.subtype = types[dominantType].subtypes[subtype].name;
        this.personality.subtypeDescription = types[dominantType].subtypes[subtype].description;
    }
};
</script>