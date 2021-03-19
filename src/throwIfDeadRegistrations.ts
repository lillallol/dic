import { Dic } from "./Dic/Dic";
import { getRegistrationOf } from "./Dic/getRegistrationOf";
import { validateNumberOfDependencies } from "./Dic/validateNumberOfDependencies";
import { tagUnindent } from "./es-utils/tagUnindent";
import { abstraction } from "./types";

export function throwIfDeadRegistrations(_: { dic: Dic; entryPointAbstractions: abstraction[] }): void {
    //@TODO validate that the entry point abstractions do not contain duplicates
    const { dic, entryPointAbstractions: entries } = _;

    const hasBeenIterated: Map<abstraction, boolean> = new Map(
        [...dic._registry.entries()].map(([abstraction]) => [abstraction, false])
    );

    entries.forEach((entry) => {
        hasBeenIterated.set(entry, true);
        (function recurse(abstraction: abstraction) {
            const registration = getRegistrationOf(dic._registry, abstraction);
            validateNumberOfDependencies(registration.dependencies, registration.factory);
            registration.dependencies.forEach((abstraction) => {
                if (hasBeenIterated.get(abstraction)) return;
                else hasBeenIterated.set(abstraction, true);
                recurse(abstraction);
            });
        })(entry);
    });

    const nonIteratedAbstractions = [...hasBeenIterated.entries()].filter(([, v]) => v === false).map(([k]) => k);
    if (nonIteratedAbstractions.length !== 0)
        throw Error(
            _errorMessages.abstractionsAreNotUsed({
                deadAbstractions: nonIteratedAbstractions,
                entryAbstractions: entries,
            })
        );
}

export const _errorMessages = {
    abstractionsAreNotUsed: (_: { deadAbstractions: abstraction[]; entryAbstractions: abstraction[] }): string => {
        const { deadAbstractions, entryAbstractions } = _;
        const printAbstractions = (abstractions: abstraction[]) => {
            return abstractions.map((abstraction) => abstraction.toString()).join(",\n");
        };
        return tagUnindent`
            The following abstractions:

                ${[printAbstractions(deadAbstractions)]}

            have registrations that are not used in the composition of the entry point,
            which consists of the following abstractions:

                ${[printAbstractions(entryAbstractions)]}
            
        `;
    },
};
