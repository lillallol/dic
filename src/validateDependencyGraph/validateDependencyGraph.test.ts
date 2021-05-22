import { Dic } from "../Dic/Dic";
import { errorMessages } from "../errorMessages";
import { IDic } from "../publicApi";
import { validateDependencyGraph } from "./validateDependencyGraph";

describe(validateDependencyGraph.name, () => {
    it("throw error for repeating abstractions in entry point abstractions", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo, TYPES.bar, TYPES.bar];
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES })).toThrow(
            errorMessages.entryPointAbstractionsArrayHasDuplicateValue({
                entryPointAbstractions,
                duplicateValueIndex: 1,
            })
        );
    });
    it("throws error for repeating abstractions in ignored abstractions", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo];
        const ignoreAbstractions: symbol[] = [TYPES.bar, TYPES.bar];
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES, ignoreAbstractions })).toThrow(
            errorMessages.ignoreAbstractionsArrayHasDuplicateValue({
                ignoreAbstractions,
                duplicateValueIndex: 0,
            })
        );
    });
    it("throws error when ignored abstractions and entry point abstractions have common abstractions", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo];
        const ignoreAbstractions: symbol[] = [TYPES.foo, TYPES.bar];
        const overlappingElement: symbol = TYPES.foo;
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES, ignoreAbstractions })).toThrow(
            errorMessages.overlapBetweenEntryPointAndIngoredAbstractions(overlappingElement)
        );
    });
    it("throws error when ignored abstractions are not registered to the dic", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo];
        const notRegisteredToDicAbstraction: symbol = Symbol("notRegistered");
        const ignoreAbstractions: symbol[] = [TYPES.bar, notRegisteredToDicAbstraction];
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES, ignoreAbstractions })).toThrow(
            errorMessages.ignoredAbstractionNotRegisteredToTheDic(notRegisteredToDicAbstraction)
        );
    });
    it.each<
        [
            {
                dic: IDic;
                TYPES: { [x: string]: symbol };
                entryPointAbstractions: symbol[];
                cycleRoot: symbol;
                cycle: symbol[];
            }
        ]
    >([
        [
            (() => {
                const dic = new Dic();
                const TYPES = {
                    a: Symbol("a"),
                };
                type interfaces = {
                    a: number;
                };
                function aFactory(a: interfaces["a"]) {
                    a;
                }
                dic.register({
                    abstraction: TYPES.a,
                    dependencies: [TYPES.a],
                    factory: aFactory,
                    lifeCycle: "singleton",
                });
                return {
                    dic,
                    TYPES,
                    cycle: [TYPES.a],
                    cycleRoot: TYPES.a,
                    entryPointAbstractions: [TYPES.a],
                };
            })(),
        ],
        [
            (() => {
                /**
                 * Entry point abstractions:
                 *
                 *     f d e a
                 *
                 * ```ts
                 * `
                 *    ${f}       ${a}-----${ac}
                 *               /    \   /
                 *            ${b}    ${c}
                 *                    /
                 *                 ${d}
                 *                 /
                 *              ${e}
                 * `
                 * ```
                 */
                const dic = new Dic();
                const TYPES = {
                    a: Symbol("a"),
                    b: Symbol("b"),
                    c: Symbol("c"),
                    d: Symbol("d"),
                    e: Symbol("e"),
                    f: Symbol("f"),
                    ac: Symbol("ac"),
                };
                const cycleRoot = TYPES.a;
                const entryPointAbstractions = [TYPES.f, TYPES.d, TYPES.e, TYPES.a];
                const cycle: symbol[] = [TYPES.a, TYPES.c, TYPES.ac];
                type interfaces = {
                    a: number;
                    b: boolean;
                    c: string;
                    d: void;
                    e: void;
                    f: void;
                    ac: void;
                };
                function aFactory(b: interfaces["b"], c: interfaces["c"]): interfaces["a"] {
                    b;
                    c;
                    return 1;
                }
                function bFactory(): interfaces["b"] {
                    return true;
                }
                function cFactory(d: interfaces["d"], ac: interfaces["ac"]): interfaces["c"] {
                    ac;
                    d;
                    return "";
                }
                function dFactory(e: interfaces["e"]): interfaces["d"] {
                    e;
                    return;
                }
                function eFactory(): interfaces["e"] {
                    return;
                }
                function fFactory(): interfaces["f"] {
                    return;
                }
                function acFactory(a: interfaces["a"]): interfaces["ac"] {
                    a;
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
                    dependencies: [TYPES.d, TYPES.ac],
                    factory: cFactory,
                    lifeCycle: "singleton",
                });
                dic.register({
                    abstraction: TYPES.d,
                    dependencies: [TYPES.e],
                    factory: dFactory,
                    lifeCycle: "singleton",
                });
                dic.register({
                    abstraction: TYPES.e,
                    dependencies: [],
                    factory: eFactory,
                    lifeCycle: "singleton",
                });
                dic.register({
                    abstraction: TYPES.f,
                    dependencies: [],
                    factory: fFactory,
                    lifeCycle: "singleton",
                });
                dic.register({
                    abstraction: TYPES.ac,
                    dependencies: [TYPES.a],
                    factory: acFactory,
                    lifeCycle: "singleton",
                });
                return {
                    dic,
                    TYPES,
                    entryPointAbstractions,
                    cycleRoot,
                    cycle,
                };
            })(),
        ],
    ])("detects circular loops in the dependency graph", ({ TYPES, cycle, cycleRoot, dic, entryPointAbstractions }) => {
        const expectedErrorMessage = errorMessages.dependencyGraphHasCycle(new Set(cycle), cycleRoot);
        expect(() =>
            validateDependencyGraph({
                dic,
                entryPointAbstractions,
                TYPES,
            })
        ).toThrow(expectedErrorMessage);
    });

    it("throws error when the provided dic has dead registration for the provided entry point abstractions", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo];
        const deadAbstractions: symbol[] = [TYPES.bar];
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES })).toThrow(
            errorMessages.abstractionsAreNotUsed({ entryPointAbstractions, deadAbstractions })
        );
    });
    it("throws error when there are missing abstractions from TYPES", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo, TYPES.bar];
        const missingTYPES = {
            bar: TYPES.bar,
            baz: TYPES.baz,
        };
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES: missingTYPES })).toThrow(
            errorMessages.typesIsMissingAbstractions({
                entryPointAbstractions: [TYPES.foo, TYPES.bar],
                missingAbstractionsFromTypes: [TYPES.foo],
            })
        );
    });
    it("throws error when there are extra abstractions from TYPES", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo, TYPES.bar];
        const extraTYPES = {
            extra: Symbol("extra"),
            ...TYPES,
        };
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES: extraTYPES })).toThrow(
            errorMessages.typesHasExtraAbstractions({
                entryPointAbstractions: [extraTYPES.foo, extraTYPES.bar],
                extraAbstractionsFromTypes: [extraTYPES.extra],
            })
        );
    });
    it("does not throw error when dead registrations are ignored", () => {
        const { dic, TYPES } = getMockDic();
        expect(() =>
            validateDependencyGraph({
                TYPES,
                dic,
                entryPointAbstractions: [TYPES.foo],
                ignoreAbstractions: [TYPES.bar],
            })
        ).not.toThrow();
    });
    it("does not throw error for a valid dependency graph", () => {
        const { dic, TYPES } = getMockDic();
        const entryPointAbstractions: symbol[] = [TYPES.foo, TYPES.bar];
        expect(() => validateDependencyGraph({ dic, entryPointAbstractions, TYPES })).not.toThrow();
    });
});

function getMockDic() {
    const dic = new Dic();

    /**
     * ```ts
     * `
     *     ${foo} ${bar}
     *        \    /
     *        ${baz}
     * `
     * ```
     */

    const TYPES = {
        foo: Symbol("foo"),
        bar: Symbol("bar"),
        baz: Symbol("baz"),
    };

    type interfaces = {
        foo: () => interfaces["baz"];
        bar: () => interfaces["baz"];
        baz: () => void;
    };

    function fooFactory(baz: interfaces["baz"]): interfaces["baz"] {
        return function foo() {
            return baz;
        };
    }

    function barFactory(baz: interfaces["baz"]): interfaces["bar"] {
        return function bar() {
            return baz;
        };
    }

    function bazFactory(): interfaces["baz"] {
        return function baz() {
            //
        };
    }

    dic.register({
        abstraction: TYPES.foo,
        dependencies: [TYPES.baz],
        factory: fooFactory,
        lifeCycle: "singleton",
    });

    dic.register({
        abstraction: TYPES.bar,
        dependencies: [TYPES.baz],
        factory: barFactory,
        lifeCycle: "singleton",
    });

    dic.register({
        abstraction: TYPES.baz,
        dependencies: [],
        factory: bazFactory,
        lifeCycle: "singleton",
    });

    return {
        dic,
        TYPES,
    };
}
