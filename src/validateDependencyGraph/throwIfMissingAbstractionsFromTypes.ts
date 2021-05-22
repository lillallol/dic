import { errorMessages } from "../errorMessages";
import { IDic, ITYPES } from "../publicApi";

export function throwIfMissingAbstractionsFromTypes(_: {
    TYPES: ITYPES;
    dic: IDic;
    entryPointAbstractions: symbol[];
}): void {
    const { TYPES, dic, entryPointAbstractions } = _;
    const missingAbstractionsFromTypes: symbol[] = [];
    const typesMap = new Map(Object.values(TYPES).map((abstraction) => [abstraction, true]));
    [...dic.registry.values()].forEach(({ abstraction }) => {
        if (typesMap.get(abstraction) !== true) missingAbstractionsFromTypes.push(abstraction);
    });

    if (missingAbstractionsFromTypes.length !== 0) {
        throw Error(
            errorMessages.typesIsMissingAbstractions({
                missingAbstractionsFromTypes,
                entryPointAbstractions,
            })
        );
    }
}
