import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import type { types } from "../types";

import { symbolToTypesKeyFactory, _errorMessages } from "./symbolToTypesKeyFactory";

let symbolToTypesKey: ReturnType<typeof symbolToTypesKeyFactory>;
let TYPES: types;

beforeEach(() => {
    TYPES = {
        a: Symbol(),
        b: Symbol(),
    };
    symbolToTypesKey = symbolToTypesKeyFactory(TYPES);
});

describe(symbolToTypesKeyFactory.name, () => {
    it("throws error when provided with a symbol that does not exist in the TYPES", () => {
        const symbol = Symbol();
        expect(() => symbolToTypesKey(symbol)).toThrow(arrayToErrorMessage(_errorMessages.symbolNotInTYPES(symbol)));
    });
    it("returns the key of the TYPES that corresponds to the symbol", () => {
        expect(symbolToTypesKey(TYPES.a)).toBe("a");
    });
});
