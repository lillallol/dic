import { arrayToErrorMessage } from "./arrayToErrorMessage";

describe(arrayToErrorMessage.name, () => {
    it.each([
        [
            {
                input: ["hello", [Symbol()]],
                output: "hello [object Array]",
            },
        ],
        [
            {
                input: ["hello", "world", "!"],
                output: "hello world !",
            },
        ],
    ])("converts the array to a message", ({ input, output }) => {
        expect(arrayToErrorMessage(input)).toBe(output);
    });
});
