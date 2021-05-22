import { Dic } from "../Dic/Dic";

describe(Dic, () => {
    it("manually injects the provided concretion", () => {
        /**
         * Dependency graph:
         *
         * ```
         *       a
         *      ↙ ↘
         *     b   c
         * ```
         */
        const dic = new Dic();
        const TYPES = {
            a: Symbol("a"),
            b: Symbol("b"),
            c: Symbol("c"),
        };

        type interfaces = {
            a: number;
            b: number;
            c: number;
        };

        function aFactory(b: interfaces["b"], c: interfaces["c"]): interfaces["a"] {
            return b + c;
        }
        function bFactory(): interfaces["b"] {
            return 1;
        }
        function cFactory(): interfaces["c"] {
            return -1;
        }
        dic.register({
            abstraction: TYPES.a,
            dependencies: [TYPES.b, TYPES.c],
            factory: aFactory,
            lifeCycle: "transient",
        });
        dic.register({
            abstraction: TYPES.b,
            dependencies: [],
            factory: bFactory,
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.c,
            dependencies: [],
            factory: cFactory,
            lifeCycle: "singleton",
        });

        const inject = new Map([[TYPES.c, -2]]);

        expect(dic.get({ abstraction: TYPES.a, inject })).toBe(1 + -2);
    });
});
