import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import { validateAbstraction, _errorMessages } from "./validateAbstraction";

describe(validateAbstraction.name, () => {
    it.each([[""], [1], [true], [null], [undefined], [{}], [[]], [() => undefined], [1n]])(
        "throws when provided with and argument that is not a symbol",
        (abstraction) => {
            expect(() => validateAbstraction(abstraction)).toThrow(
                arrayToErrorMessage(_errorMessages.abstractionHasToBeASymbol(abstraction))
            );
        }
    );
    it("does not throw when provided with an argument that is symbol", () => {
        expect(() => validateAbstraction(Symbol())).not.toThrow();
    });
});
