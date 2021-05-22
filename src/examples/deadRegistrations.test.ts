import { Dic } from "../Dic/Dic";
import { tagUnindent } from "../es-utils/tagUnindent";
import { validateDependencyGraph } from "../validateDependencyGraph/validateDependencyGraph";

describe(validateDependencyGraph.name, () => {
    it("throws when the combined entry point abstractions not cover the whole dependency graph", () => {
        /**
         * Dependency graph:
         *
         * ```
         *       a   d
         *      ↙ ↘ ↙
         *     b   c
         * ```
         *
         * Entry point abstractions:
         *
         *     a
         *
         * Dead abstraction:
         *
         *     d
         *
         */
        const dic = new Dic();
        const TYPES = {
            a: Symbol("a"),
            b: Symbol("b"),
            c: Symbol("c"),
            d: Symbol("d"),
        };

        type interfaces = {
            a: void;
            b: void;
            c: void;
            d: void;
        };

        function aFactory(b: interfaces["b"], c: interfaces["c"]): interfaces["a"] {
            b; //use b somehow
            c; //use c somehow
            return;
        }
        function bFactory(): interfaces["b"] {
            return;
        }
        function cFactory(): interfaces["c"] {
            return;
        }
        function dFactory(c: interfaces["c"]): interfaces["d"] {
            c; //use c somehow
            return;
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
        dic.register({
            abstraction: TYPES.d,
            dependencies: [TYPES.c],
            factory: dFactory,
            lifeCycle: "singleton",
        });
        expect(() =>
            validateDependencyGraph({
                TYPES,
                dic,
                entryPointAbstractions: [TYPES.a],
            })
        ).toThrow(tagUnindent`
            The following abstractions:

                Symbol(d)

            are not used by the entry point abstractions:

                Symbol(a)

        `);
    });
});
