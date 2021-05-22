import { Dic } from "../Dic/Dic";

describe(Dic.name, () => {
    it("allows interception", () => {
        const dic = new Dic();
        const TYPES = {
            a: Symbol("a"),
        };
        type interfaces = {
            a: (x1: number, x2: number) => number;
        };
        function aFactory(): interfaces["a"] {
            return function a(x1, x2) {
                return x1 + x2;
            };
        }
        dic.register(
            {
                abstraction: TYPES.a,
                dependencies: [],
                factory: aFactory,
                lifeCycle: "singleton",
            },
            {
                intercept: [
                    ({ concretion }) => {
                        return function a(x1, x2) {
                            if (typeof x1 !== "number") throw Error("`x1` has to be of type number.");
                            if (typeof x2 !== "number") throw Error("`x2` has to be of type number.");
                            return concretion(x1, x2);
                        };
                    },
                ],
            }
        );

        const a: interfaces["a"] = dic.get({ abstraction: TYPES.a });

        //@ts-expect-error
        expect(() => a("0", 1)).toThrow();
    });
});
