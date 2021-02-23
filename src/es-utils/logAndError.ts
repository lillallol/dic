import { arrayToErrorMessage } from "./arrayToErrorMessage";

/**
 * @description
 * Error logs and throws error the provided array as string.
 * @example
 * const foo = 1;
 * logAndError(["parameter foo",foo,"has to be of type function"]);
 * //same as
 * console.error("parameter foo",foo,"has to be of type function");
 * throw Error("parameter foo " + String(foo) + " has to be of type function");
 */
export function logAndError(args: unknown[]): never {
    console.error(...args);
    throw Error(arrayToErrorMessage(args));
}
