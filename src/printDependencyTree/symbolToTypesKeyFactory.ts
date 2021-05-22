import { errorMessages } from "../errorMessages";
import type { ITYPES } from "../publicApi";

export function symbolToTypesKeyFactory(TYPES: ITYPES): (symbol: symbol) => string {
    const symbolToTYPESPropertyPath: Map<symbol, string> = new Map();

    Object.entries(TYPES).forEach(([k, v]) => {
        symbolToTYPESPropertyPath.set(v, k);
    });

    return function (symbol: symbol): string {
        const path = symbolToTYPESPropertyPath.get(symbol);
        if (path === undefined) throw Error(errorMessages.symbolNotInTYPES(symbol));
        return path;
    };
}
