import { tagUnindent } from "./es-utils/tagUnindent";

export const errorMessages = {
    badFactoryName: tagUnindent`
        There two cases here, you are passing a:
    
            * name less non arrow function for factory 
            * name full function with name "factory"
    
        For any case, change the name.
    `,
    inconsistentNumberOfDependencies: (factory: Function): string => tagUnindent`
        Factory with name:
        
            ${factory.name}
            
        does not have the same number of dependencies as its registration.
    `,
    factoryHasToHaveName: tagUnindent`
        Factory function can not have empty name. The factory names are used for better error messages.
    `,
    abstractionAlreadyRegistered: (abstraction: symbol): string => tagUnindent`
        Abstraction: 

            ${String(abstraction)}

        is already registered,
    `,
    abstractionNotRegisteredToDic: (abstraction: symbol): string => tagUnindent`
        Provided abstraction with name:

            ${abstraction.toString()}

        is not registered to the dic.
    `,
    dependencyGraphHasCycle: (path: Set<symbol>, duplicatedAbstraction: symbol): string => {
        const abstractions = [...path.keys()];
        if (abstractions.length === 1)
            return tagUnindent`
                Abstraction:
        
                    ${String(abstractions[0])}
        
                self references itself.
            `;
        const firstIndexOfDuplicatedAbstraction = abstractions.indexOf(duplicatedAbstraction);

        const graphWithCyclePrettyPrinted = abstractions
            .slice(firstIndexOfDuplicatedAbstraction)
            .map((abstraction, i, arr) => {
                if (i === 0) return `┌> ${String(abstraction)}`;
                if (i === arr.length - 1) return `└─ ${String(abstraction)}`;
                return `│  ${String(abstraction)}`;
            })
            .join("\n│   ↓\n");

        return tagUnindent`
            The composition graph of:
            
                ${String(duplicatedAbstraction)}

            has a cycle on the following path:

                ${[graphWithCyclePrettyPrinted]}

        `;
    },
    abstractionsAreNotUsed: (_: { deadAbstractions: symbol[]; entryPointAbstractions: symbol[] }): string => {
        const { deadAbstractions, entryPointAbstractions } = _;
        const printAbstractions = (abstractions: symbol[]) => {
            return abstractions.map((abstraction) => abstraction.toString()).join(",\n");
        };
        return tagUnindent`
            The following abstractions:

                ${[printAbstractions(deadAbstractions)]}

            are not used by the entry point abstractions:

                ${[printAbstractions(entryPointAbstractions)]}
            
        `;
    },
    ignoredAbstractionNotRegisteredToTheDic: (ignoredAbstraction: symbol): string => `
        Ignored abstraction:
        
            ${String(ignoredAbstraction)}
        
        is not registered to the provided dic as it has to be.
    `,
    overlapBetweenEntryPointAndIngoredAbstractions: (commonsAbstraction: symbol): string => tagUnindent`
        The following abstraction:

            ${String(commonsAbstraction)}

        is common in both entry point abstractions and abstractions to be ignored.

        Abstractions to be ignored and entry point abstractions have to not overlap.
    `,
    ignoreAbstractionsArrayHasDuplicateValue: (_: {
        ignoreAbstractions: symbol[];
        duplicateValueIndex: number;
    }): string => {
        const { duplicateValueIndex, ignoreAbstractions: ignoreAbstractionsArray } = _;
        const abstractionAsString = String(ignoreAbstractionsArray[duplicateValueIndex]);
        return tagUnindent`
            Ignore abstractions array has duplicate abstraction:

                ${abstractionAsString}

            at index:

                ${duplicateValueIndex}
            
        `;
    },
    entryPointAbstractionsArrayHasDuplicateValue: (_: {
        entryPointAbstractions: symbol[];
        duplicateValueIndex: number;
    }): string => {
        const { duplicateValueIndex, entryPointAbstractions: entryPointAbstractionsArray } = _;
        const abstractionAsString = String(entryPointAbstractionsArray[duplicateValueIndex]);
        return tagUnindent`
            Entry point abstractions array has duplicate abstraction:
            
                ${abstractionAsString}

            at index:

                ${duplicateValueIndex}

        `;
    },
    typesIsMissingAbstractions: (_: {
        missingAbstractionsFromTypes: symbol[];
        entryPointAbstractions: symbol[];
    }): string => {
        const { entryPointAbstractions, missingAbstractionsFromTypes } = _;

        const missingAbstractionsAsMultiLineString = missingAbstractionsFromTypes
            .map((abstraction) => abstraction.toString())
            .join("\n");
        const entryPointAbstractionsAsMultiLineString = entryPointAbstractions
            .map((abstraction) => abstraction.toString())
            .join("\n");

        return tagUnindent`
            The following abstractions:

                ${[missingAbstractionsAsMultiLineString]}

            of TYPES object, are not used by the entries:
            
                ${[entryPointAbstractionsAsMultiLineString]}
            
        `;
    },
    typesHasExtraAbstractions: (_: {
        extraAbstractionsFromTypes: symbol[];
        entryPointAbstractions: symbol[];
    }): string => {
        const { entryPointAbstractions, extraAbstractionsFromTypes } = _;
        const extraTypesAbstractionsAsMultiLineString = extraAbstractionsFromTypes
            .map((abstraction) => abstraction.toString())
            .join("\n");
        const entryPointAbstractionsAsMultiLineString = entryPointAbstractions
            .map((abstraction) => abstraction.toString())
            .join("\n");

        return tagUnindent`
            The following abstractions:

                ${[extraTypesAbstractionsAsMultiLineString]}

            of TYPES object, are not used by the entries:

                ${[entryPointAbstractionsAsMultiLineString]}

        `;
    },
    symbolHasToHaveName: tagUnindent`
        Symbol has to have a name.
        
        Here is an example of symbol with name:
        
            Symbol("my name")
        
    `,
    symbolNotInTYPES: (symbol: symbol): string => tagUnindent`
        Provided symbol:

            ${String(symbol)}
        
        is not in TYPES.
    `,
    //#region internal library error
    internalLibraryError: "Internal library error.",
    //#endregion
};
