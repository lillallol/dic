import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import {  validateIntercept, _errorMessages } from "./validateIntercept";

describe(validateIntercept.name, () => {
    it.each([
        [
            {
                intercept: "",
            },
        ],
        [
            {
                intercept: 1,
            },
        ],
        [
            {
                intercept: false,
            },
        ],
        [
            {
                intercept: undefined,
            },
        ],
        [
            {
                intercept: null,
            },
        ],
        [
            {
                intercept: {},
            },
        ],
        [
            {
                intercept: Symbol(),
            },
        ],
        [
            {
                intercept: 1n,
            },
        ],
    ])("throws error when the provided intercept is not array", ({ intercept }) => {
        expect(() => validateIntercept(intercept)).toThrowError(
            arrayToErrorMessage(_errorMessages.interceptHasToBeAnArray(intercept))
        );
    });
    it.each([
        [{ intercept: [() => undefined, ""] }],
        [{ intercept: [() => undefined, 1] }],
        [{ intercept: [() => undefined, false] }],
        [{ intercept: [() => undefined, undefined] }],
        [{ intercept: [() => undefined, null] }],
        [{ intercept: [() => undefined, {}] }],
        [{ intercept: [() => undefined, []] }],
        [{ intercept: [() => undefined, Symbol("")] }],
        [{ intercept: [() => undefined, 1n] }],
    ])("throws error when the provided intercept array has an element that is not a function", ({ intercept }) => {
        console.log(arrayToErrorMessage(_errorMessages.interceptBadChild(intercept, intercept[1])));
        expect(() => validateIntercept(intercept)).toThrowError(
            arrayToErrorMessage(_errorMessages.interceptBadChild(intercept, intercept[1]))
        );
    });
    it.each([
        [{ intercept: [() => undefined] }],
        //@TODO I have to find a way to throw error for this case
        [{ intercept: [() => undefined, class {}] }],
    ])("does not throw error when the provided intercept is an array of functions", ({ intercept }) => {
        expect(() => validateIntercept(intercept)).not.toThrowError();
    });
});
