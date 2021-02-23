import { logAndError } from "../es-utils/logAndError";
import type { types } from "../types";

export function symbolToTypesKeyFactory(TYPES: types): (symbol: symbol) => string {
    const symbolToTYPESPropertyPath: Map<symbol, string> = new Map();

    Object.entries(TYPES).forEach(([k, v]) => {
        symbolToTYPESPropertyPath.set(v, k);
    });

    return function (symbol: symbol): string {
        const path = symbolToTYPESPropertyPath.get(symbol);
        if (path === undefined) logAndError(_errorMessages.symbolNotInTYPES(symbol));
        return path;
    };
}

export const _errorMessages = {
    symbolNotInTYPES: (symbol: symbol): unknown[] => ["Provided symbol : ", symbol, " not in TYPES"],
};
