import { getRegistrationStrictOf } from "../Dic/getRegistrationStrictOf";
import { errorMessages } from "../errorMessages";
import { getIndexOfFirstDuplicateValueOfArray } from "../es-utils/getIndexOfFirstDuplicateValueOfArray";
import { getFirstOverlappingElementData } from "../es-utils/getFirstOverlappingElementData";
import { IDic, ITYPES } from "../publicApi";
import { detectCycles } from "./detectCycles";
import { isLiveAbstraction } from "./isLiveAbstraction";
import { throwIfExtraAbstractionsFromTypes } from "./throwIfExtraAbstractionsFromTypes";
import { throwIfMissingAbstractionsFromTypes } from "./throwIfMissingAbstractionsFromTypes";

export const validateDependencyGraph = function validateDependencyGraph(parameters: {
    dic: IDic;
    /**
     * @description
     * The abstractions that have their concretions exposed in the entry point of your program.
     */
    entryPointAbstractions: symbol[];
    TYPES: ITYPES;
    /**
     * @description
     * Abstractions that are not used by the entry points.
     * These abstractions have to be in the `TYPES` object.
     */
    ignoreAbstractions?: symbol[];
}): void {
    const { dic, entryPointAbstractions, TYPES } = parameters;

    // initialize parameters
    let { ignoreAbstractions } = parameters;
    if (ignoreAbstractions === undefined) ignoreAbstractions = [];

    // throw for duplicate value in entry point abstractions array
    const entryPointAbstractionsDuplicateIndex = getIndexOfFirstDuplicateValueOfArray({
        array: entryPointAbstractions,
    });
    if (entryPointAbstractionsDuplicateIndex !== -1) {
        throw Error(
            errorMessages.entryPointAbstractionsArrayHasDuplicateValue({
                duplicateValueIndex: entryPointAbstractionsDuplicateIndex,
                entryPointAbstractions,
            })
        );
    }

    // throw for duplicate value in ignore abstractions array
    const ignoreAbstractionsDuplicateIndex = getIndexOfFirstDuplicateValueOfArray({ array: ignoreAbstractions });
    if (ignoreAbstractionsDuplicateIndex !== -1) {
        throw Error(
            errorMessages.ignoreAbstractionsArrayHasDuplicateValue({
                duplicateValueIndex: ignoreAbstractionsDuplicateIndex,
                ignoreAbstractions,
            })
        );
    }

    // throw for overlapping abstraction between ignore abstractions and entry point abstractions
    const indexes = getFirstOverlappingElementData({
        array1: entryPointAbstractions,
        array2: ignoreAbstractions,
    });

    if (indexes !== null) {
        const overlappingElement = indexes.overlappingElement;
        throw Error(errorMessages.overlapBetweenEntryPointAndIngoredAbstractions(overlappingElement));
    }

    // throw for ignored abstraction not registered to the dic
    //@TODO make it throw error with all the ignored abstractions that are not registered to the dic
    ignoreAbstractions.forEach((ignoredAbstraction) => {
        try {
            getRegistrationStrictOf(dic.registry, ignoredAbstraction);
        } catch {
            throw Error(errorMessages.ignoredAbstractionNotRegisteredToTheDic(ignoredAbstraction));
        }
    });

    // throw for cycles in the dependency graph
    detectCycles({
        dic,
        entryPointAbstractions,
    });

    // throw for dead registrations
    const hasBeenIterated = isLiveAbstraction({
        dic,
        entryPointAbstractions,
        ignoreAbstractions,
    });

    const nonIteratedAbstractions = [...hasBeenIterated.entries()].filter(([, v]) => v === false).map(([k]) => k);
    if (nonIteratedAbstractions.length !== 0) {
        throw Error(
            errorMessages.abstractionsAreNotUsed({
                deadAbstractions: nonIteratedAbstractions,
                entryPointAbstractions,
            })
        );
    }

    //
    throwIfMissingAbstractionsFromTypes({
        TYPES,
        entryPointAbstractions,
        dic,
    });

    //
    throwIfExtraAbstractionsFromTypes({
        TYPES,
        dic,
        entryPointAbstractions,
    });
};
