import { validateDependencyGraph } from "../";
import { Dic } from "../Dic/Dic";
import { tagUnindent } from "../es-utils/tagUnindent";

describe(validateDependencyGraph.name, () => {
    it("detects circular loops in the dependency graph", () => {
        /**
         * Dependency graph:
         *
         * ```
         *    a  ←  c
         *     ↘   ↗
         *       b
         * ```
         *
         * Entry point abstraction:
         *
         *    a
         *
         */
        const dic = new Dic();
        const TYPES = {
            a: Symbol("a"),
            b: Symbol("b"),
            c: Symbol("c"),
        };
        const entryPointAbstractions = [TYPES.a];
        type interfaces = {
            a: void;
            b: void;
            c: void;
        };
        function aFactory(b: interfaces["b"]): interfaces["a"] {
            b; //use b somehow
        }
        function bFactory(c: interfaces["c"]): interfaces["b"] {
            c; //use c somehow
        }
        function cFactory(a: interfaces["a"]): interfaces["c"] {
            a; //use a somehow
        }
        dic.register({
            abstraction: TYPES.a,
            dependencies: [TYPES.b],
            factory: aFactory,
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.b,
            dependencies: [TYPES.c],
            factory: bFactory,
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.c,
            dependencies: [TYPES.a],
            factory: cFactory,
            lifeCycle: "singleton",
        });

        expect(() =>
            validateDependencyGraph({
                dic,
                entryPointAbstractions,
                TYPES,
            })
        ).toThrow(tagUnindent`
            The composition graph of:
            
                Symbol(a)
            
            has a cycle on the following path:
            
                ┌> Symbol(a)
                │   ↓
                │  Symbol(b)
                │   ↓
                └─ Symbol(c)
        `);
    });
});
