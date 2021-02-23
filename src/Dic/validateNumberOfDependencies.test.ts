import { validateNumberOfDependencies, _errorMessages } from "./validateNumberOfDependencies";

describe(validateNumberOfDependencies.name, () => {
    it.each([
        [() => undefined, [Symbol()]],
        [
            function (a: string) {
                a;
            },
            [Symbol(), Symbol()],
        ],
    ])(
        "throws when provided with a function that has length different from the length of dependencies",
        (func, deps) => {
            expect(() => validateNumberOfDependencies(deps, func)).toThrowError(
                _errorMessages.inconsistentNumberOfDependencies(func)
            );
        }
    );
    it.each([
        [(a: string) => a, [Symbol()]],
        [
            class Foo {
                constructor(a: string, b: string) {
                    a + b;
                }
            },
            [Symbol(), Symbol()],
        ],
    ])(
        "does not throw when provided with a function that has length same as the length of dependencies",
        (func, deps) => {
            expect(() => validateNumberOfDependencies(deps, func)).not.toThrow();
        }
    );
});
