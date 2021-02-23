import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import { validateDependencies, _errorMessages } from "./validateDependencies";

describe(validateDependencies.name, () => {
    it.each([[""], [1], [false], [undefined], [null], [{}], [() => undefined], [1n]])(
        "throws error when the provided dependencies is not an array",
        (dependencies) => {
            expect(() => validateDependencies(dependencies)).toThrow(
                arrayToErrorMessage(_errorMessages.dependenciesHasToBeAnArray(dependencies))
            );
        }
    );
    it.each([
        [{ dependencies: [Symbol(), ""], nonSymbolIndex: 1 }],
        [{ dependencies: [1, Symbol()], nonSymbolIndex: 0 }],
        [{ dependencies: [Symbol(), Symbol(), false], nonSymbolIndex: 2 }],
        [{ dependencies: [Symbol(), undefined], nonSymbolIndex: 1 }],
        [{ dependencies: [Symbol(), null, Symbol()], nonSymbolIndex: 1 }],
        [{ dependencies: [Symbol(), {}], nonSymbolIndex: 1 }],
        [{ dependencies: [Symbol(), () => undefined], nonSymbolIndex: 1 }],
        [{ dependencies: [Symbol(), 1n], nonSymbolIndex: 1 }],
    ])(
        "throws error when the provided dependencies array has non symbol elements",
        ({ dependencies, nonSymbolIndex }) => {
            expect(() => validateDependencies(dependencies)).toThrow(
                arrayToErrorMessage(_errorMessages.dependencyHasToBeASymbol(dependencies[nonSymbolIndex]))
            );
        }
    );
    it.each([[[Symbol(), Symbol(), Symbol()]], [[Symbol(), Symbol()]], [[Symbol()]]])(
        "does not throw error when provided with an array that has symbols as elements",
        (dependencies) => {
            expect(() => validateDependencies(dependencies)).not.toThrow();
        }
    );
});
