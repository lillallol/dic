import { errorMessages } from "../errorMessages";
import { IDic, ITYPES } from "../publicApi";

export function throwIfExtraAbstractionsFromTypes(_: {
    TYPES: ITYPES;
    dic: IDic;
    entryPointAbstractions: symbol[];
}): void {
    const { TYPES, dic, entryPointAbstractions } = _;
    const extraAbstractionsFromTypes: symbol[] = [];
    Object.values(TYPES).forEach((abstraction) => {
        if (dic.registry.get(abstraction) === undefined) extraAbstractionsFromTypes.push(abstraction);
    });

    if (extraAbstractionsFromTypes.length !== 0) {
        throw Error(
            errorMessages.typesHasExtraAbstractions({
                entryPointAbstractions,
                extraAbstractionsFromTypes,
            })
        );
    }
}
