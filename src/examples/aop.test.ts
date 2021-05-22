import { Dic } from "../Dic/Dic";

describe(Dic.name, () => {
    it("enables AOP via interception", () => {
        const dic = new Dic();

        const TYPES = {
            foo: Symbol("foo"),
            bar: Symbol("bar"),
            baz: Symbol("baz"),
        };

        type interfaces = {
            foo: () => void;
            bar: () => void;
            baz: () => void;
        };

        function fooFactory(bar: interfaces["bar"], baz: interfaces["baz"]): interfaces["foo"] {
            return function foo() {
                bar();
                baz();
                return;
            };
        }

        function barFactory(): interfaces["bar"] {
            return function bar() {
                return;
            };
        }

        function bazFactory(): interfaces["baz"] {
            return function baz() {
                return;
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

        const callStack: string[] = [];

        dic.registry.forEach((registration) => {
            registration.intercept.push(({ concretion }) => {
                if (typeof concretion === "function") {
                    return (...args: unknown[]) => {
                        callStack.push(concretion.name);
                        return concretion(...args);
                    };
                }
                return concretion;
            });
        });

        const foo: interfaces["foo"] = dic.get({ abstraction: TYPES.foo });

        foo();

        expect(callStack).toEqual(["foo", "bar", "baz"]);
    });
});
