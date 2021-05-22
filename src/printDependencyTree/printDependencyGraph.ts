import type { IDic, ITYPES } from "../publicApi";
import { getRegistrationStrictOf } from "../Dic/getRegistrationStrictOf";
import { symbolToTypesKeyFactory } from "./symbolToTypesKeyFactory";
import { tagUnindent } from "../es-utils/tagUnindent";
import { constants } from "../constants";

export const printDependencyGraph = function printDependencyGraph(parameters: {
    /**
     * @description
     * The dependency injection container instance that contains the registration of the dependency graph
     * that you want to print.
     */
    dic: IDic;
    /**
     * @description
     * The abstraction for which the dependency graph will be printed.
     */
    rootAbstraction: symbol;
    /**
     * @description
     * An object literal that maps strings to abstractions. The strings will be used as names for
     * the abstractions when the dependency tree is printed.
     */
    TYPES: ITYPES;
}): string {
    const { dic, rootAbstraction, TYPES: types } = parameters;
    const { stem, subGraphHasBeenAlreadyPrintedSymbol, twig } = constants;
    const symbolToTypesPropertyPath = symbolToTypesKeyFactory(types);

    let depth = 1;
    let maxDepth = 0;
    let totalNumberOfComponents = 0;
    const isCommon: Map<symbol, boolean> = new Map();

    let stringToReturn = symbolToTypesPropertyPath(rootAbstraction);

    const intend: string[] = [];
    if (twig.length - stem.length < 0) {
        throw Error(tagUnindent`
            Internal library error:
            
            Twig length has to be greater than stem length.
        `);
    }

    const twigTypeSeparator = " ";

    (function recurse(currentAbstraction: symbol, identString: string) {
        if (depth > maxDepth) maxDepth = depth;
        const registration = getRegistrationStrictOf(dic.registry, currentAbstraction);
        if (!isCommon.has(currentAbstraction)) totalNumberOfComponents++;
        const { dependencies } = registration;
        const lastI = dependencies.length - 1;

        if (isCommon.has(currentAbstraction) && dependencies.length !== 0) {
            stringToReturn += " " + subGraphHasBeenAlreadyPrintedSymbol;
            return;
        } else {
            isCommon.set(currentAbstraction, true);
        }

        for (let i = 0; i < dependencies.length; i++) {
            const nextDependency = dependencies[i];
            stringToReturn +=
                "\n" + intend.join("") + twig + twigTypeSeparator + symbolToTypesPropertyPath(nextDependency);

            depth++;
            if (i === lastI) {
                intend.push(" ".repeat(twig.length) + twigTypeSeparator);
                recurse(nextDependency, identString);
                intend.pop();
            } else {
                intend.push(stem + " ".repeat(twig.length - stem.length) + twigTypeSeparator);
                recurse(nextDependency, identString);
                intend.pop();
            }
            depth--;
        }
    })(rootAbstraction, "");

    stringToReturn = `total number of unique components: ${totalNumberOfComponents}\n` + "\n" + stringToReturn;

    return stringToReturn.trim();
};
