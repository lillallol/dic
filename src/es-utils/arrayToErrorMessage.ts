/**
 * @description
 * Maps each element of the provided array to a string and then reduces
 * the result to a string which is returned.
 * @example
 * arrayToErrorMessage(["hello","world","!",1])
 * //returns
 * "hello world ! 1";
 */
export function arrayToErrorMessage(args: unknown[]): string {
    return args
        .map((arg) => {
            if (Array.isArray(arg)) return "[object Array]";
            //That is so that it does not fail for `arrayToErrorMessage([[Symbol()]])`
            else return String(arg);
        })
        .reduce((a, c) => a + " " + c);
}
