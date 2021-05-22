import { namesFactory } from "./NAMES";

describe("NAMES", () => {
    it("returns the provided key", () => {
        const TYPES = {
            a: Symbol("a"),
        };
        const NAMES = namesFactory<typeof TYPES>();
        expect(NAMES("a")).toBe("a");
    });
});
