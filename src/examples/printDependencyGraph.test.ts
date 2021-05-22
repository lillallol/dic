import { Dic, printDependencyGraph } from "../";
import { tagUnindent } from "../es-utils/tagUnindent";

describe(printDependencyGraph.name, () => {
    it("prints the dependency graph", () => {
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
            a: void;
            b: void;
            c: void;
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

        dic.register({
            abstraction: TYPES.a,
            dependencies: [TYPES.b, TYPES.c],
            factory: aFactory,
            lifeCycle: "singleton",
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

        expect(printDependencyGraph({ TYPES, dic, rootAbstraction: TYPES.a })).toBe(tagUnindent`
            total number of unique components: 3

            a
            |_ b
            |_ c
        `);
    });
});
