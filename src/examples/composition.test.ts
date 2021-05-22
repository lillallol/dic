import { Dic } from "../Dic/Dic";

describe(Dic.name, () => {
    it("creates the concretion of the provided abstraction", () => {
        /**
         * Dependency graph:
         *
         * ```
         *       foo
         *      ↙   ↘
         *    bar   baz
         * ```
         */
        const dic = new Dic();
        const TYPES = {
            foo: Symbol("foo"),
            bar: Symbol("bar"),
            baz: Symbol("baz"),
        };

        type interfaces = {
            foo: (x: number) => number;
            bar: () => number;
            baz: () => number;
        };

        function fooFactory(bar: interfaces["bar"], baz: interfaces["baz"]): interfaces["foo"] {
            return function foo(x) {
                return bar() + baz() + x;
            };
        }
        function barFactory(): interfaces["bar"] {
            return function bar() {
                return 1;
            };
        }
        function bazFactory(): interfaces["baz"] {
            return function baz() {
                return -1;
            };
        }

        dic.register({
            abstraction: TYPES.foo,
            dependencies: [TYPES.bar, TYPES.baz],
            factory: fooFactory,
            lifeCycle: "transient",
        });
        dic.register({
            abstraction: TYPES.bar,
            dependencies: [],
            factory: barFactory,
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.baz,
            dependencies: [],
            factory: bazFactory,
            lifeCycle: "singleton",
        });

        const foo: interfaces["foo"] = dic.get({ abstraction: TYPES.foo });

        expect(foo(0)).toBe(1 + -1 + 0);
    });
});
