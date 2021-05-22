import { errorMessages } from "../errorMessages";
import type { ITYPES } from "../publicApi";

import { symbolToTypesKeyFactory } from "./symbolToTypesKeyFactory";

let symbolToTypesKey: ReturnType<typeof symbolToTypesKeyFactory>;
let TYPES: ITYPES;

beforeEach(() => {
    TYPES = {
        a: Symbol("a"),
        b: Symbol("b"),
    };
    symbolToTypesKey = symbolToTypesKeyFactory(TYPES);
});

describe(symbolToTypesKeyFactory.name, () => {
    it("throws error when provided with a symbol that does not exist in the TYPES", () => {
        const symbol = Symbol("symbol");
        expect(() => symbolToTypesKey(symbol)).toThrow(errorMessages.symbolNotInTYPES(symbol));
    });
    it("returns the key of the TYPES that corresponds to the symbol", () => {
        expect(symbolToTypesKey(TYPES.a)).toBe("a");
    });
});
