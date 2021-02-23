import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import { throwIfNotAppropriateFactory, _errorMessages } from "./throwIfNotAppropriateFactory";

describe(throwIfNotAppropriateFactory.name, () => {
    it.each([[""], [1], [false], [undefined], [null], [{}], [[]], [Symbol()], [1n]])(
        "throws error when the provided factory is not of type function",
        (factory) => {
            expect(() => throwIfNotAppropriateFactory(factory)).toThrowError(
                arrayToErrorMessage(_errorMessages.factoryHasToBeAFunction(factory))
            );
        }
    );
    it.each([
        [function foo() {
            //
        }],
        //@TODO find how to throw error for that
        [class A {}],
    ])("does not throw error when the provided factory is of type function", (factory) => {
        expect(() => throwIfNotAppropriateFactory(factory)).not.toThrowError();
    });
    it("throws error when the provided function has undefined name", () => {
        expect(() => throwIfNotAppropriateFactory(() => "")).toThrow(_errorMessages.factoryCanNotBeFunctionWithNoName);
    });
});
