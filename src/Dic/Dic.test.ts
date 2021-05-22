import { errorMessages } from "../errorMessages";
import { Dic } from "./Dic";

describe(Dic.name, () => {
    describe(Dic.prototype.register.name, () => {
        /**
         * Function have to have names because, because this creates more
         * helpful error messages.
         */
        it("throws error when the registered factory has no name", () => {
            const dic = new Dic();
            expect(() =>
                dic.register({
                    abstraction: Symbol("mock"),
                    dependencies: [],
                    factory: function () {
                        // some code
                    },
                    lifeCycle: "singleton",
                })
            ).toThrow(errorMessages.badFactoryName);
        });
        it("throws error when the abstraction is already registered", () => {
            const dic = new Dic();
            const TYPES = {
                mock: Symbol("mock"),
            };
            function mockFactory() {
                //
            }
            const register = () =>
                dic.register({
                    abstraction: TYPES.mock,
                    dependencies: [],
                    factory: mockFactory,
                    lifeCycle: "singleton",
                });
            register();
            expect(() => register()).toThrow(errorMessages.abstractionAlreadyRegistered(TYPES.mock));
        });
        /**
         * Abstraction symbols have to have names because, because this creates
         * more helpful error messages.
         */
        it("throws error when the registered abstraction symbol has no name", () => {
            const dic = new Dic();
            expect(() =>
                dic.register({
                    abstraction: Symbol(),
                    dependencies: [],
                    factory: function mock() {
                        // some code
                    },
                    lifeCycle: "singleton",
                })
            ).toThrow(errorMessages.symbolHasToHaveName);
        });
        it("throws error when the registration has different number of dependencies from its factory", () => {
            const dic = new Dic();
            function mockFactory() {
                return;
            }
            expect(() =>
                dic.register({
                    abstraction: Symbol("mock"),
                    dependencies: [Symbol("some dependency")],
                    factory: mockFactory,
                    lifeCycle: "singleton",
                })
            ).toThrow(errorMessages.inconsistentNumberOfDependencies(mockFactory));
        });
    });
    describe(Dic.prototype.unregister.name, () => {
        it("un-registers the registered abstraction from the registry and returns `true`", () => {
            const dic = new Dic();
            const TYPES = {
                my: Symbol("my"),
            };
            function myFactory() {
                //
            }
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "singleton",
            });
            expect(dic.unregister({ abstraction: TYPES.my })).toBe(true);
            expect(() => dic.get({ abstraction: TYPES.my })).toThrow();
        });
        it("returns false when the abstraction to unregister is not registered", () => {
            const dic = new Dic();
            const TYPES = {
                my: Symbol("my"),
            };
            expect(dic.unregister({ abstraction: TYPES.my })).toBe(false);
        });
    });
    describe(Dic.prototype.get.name, () => {
        it("throws error for getting an abstraction that does not exist", () => {
            const dic = new Dic();
            const TYPES = {
                mock: Symbol("mock"),
            };
            expect(() => dic.get({ abstraction: TYPES.mock })).toThrow(
                errorMessages.abstractionNotRegisteredToDic(TYPES.mock)
            );
        });
        it("memoizes for singleton lifecycle", () => {
            const dic = new Dic();
            const TYPES = {
                my: Symbol("my"),
            };
            function myFactory() {
                return {};
            }
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "singleton",
            });
            expect(dic.get({ abstraction: TYPES.my })).toBe(dic.get({ abstraction: TYPES.my }));
        });
        it("does not memoize for transient lifecycle", () => {
            const dic = new Dic();
            const TYPES = {
                my: Symbol("my"),
            };
            function myFactory() {
                return {};
            }
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "transient",
            });
            expect(dic.get({ abstraction: TYPES.my })).not.toBe(dic.get({ abstraction: TYPES.my }));
        });
        it("wraps the get value with the function provided by intercept", () => {
            const dic = new Dic();
            const TYPES = {
                foo: Symbol("foo"),
            };
            const array: number[] = [];
            const returnedValue = 1;
            function fooFactory() {
                return function foo() {
                    array.push(1);
                    return returnedValue;
                };
            }
            dic.register(
                {
                    abstraction: TYPES.foo,
                    dependencies: [],
                    factory: fooFactory,
                    lifeCycle: "transient",
                },
                {
                    intercept: [
                        (_) => {
                            const { concretion: v } = _;
                            return () => {
                                array.push(0);
                                const result = v();
                                array.push(2);
                                return result;
                            };
                        },
                    ],
                }
            );
            expect(dic.get<ReturnType<typeof fooFactory>>({ abstraction: TYPES.foo })()).toBe(returnedValue);
            expect(array).toEqual([0, 1, 2]);
        });
        it("manually injects the provided concretions of inject, when it resolves the dependency graph to concretions", () => {
            const dic = new Dic();
            const TYPES = {
                top: Symbol("top"),
                left: Symbol("left"),
                right: Symbol("right"),
                bottom: Symbol("bottom"),
            };
            type interfaces = {
                left: () => number;
                right: () => number;
                top: () => number;
                bottom: () => number;
            };
            function leftFactory(): interfaces["left"] {
                return function left() {
                    return -1;
                };
            }
            function rightFactory(bottom: interfaces["bottom"]): interfaces["right"] {
                return function right() {
                    return bottom();
                };
            }
            function bottomFactory(): interfaces["bottom"] {
                return function bottom() {
                    return 1;
                };
            }
            function topFactory(left: interfaces["left"], right: interfaces["right"]): interfaces["top"] {
                return function top() {
                    return left() + right();
                };
            }
            dic.register({
                abstraction: TYPES.top,
                dependencies: [TYPES.left, TYPES.right],
                factory: topFactory,
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.left,
                dependencies: [],
                factory: leftFactory,
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.right,
                dependencies: [TYPES.bottom],
                factory: rightFactory,
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.bottom,
                dependencies: [],
                factory: bottomFactory,
                lifeCycle: "singleton",
            });
            expect(
                dic.get<interfaces["top"]>({
                    abstraction: TYPES.top,
                    inject: (() => {
                        const map = new Map();
                        map.set(TYPES.bottom, () => {
                            return +2;
                        });
                        return map;
                    })(),
                })()
            ).toBe(+1);
        });
        it("works as expected for a more realistic example", () => {
            const dic = new Dic();
            const TYPES = {
                foo: Symbol("foo"),
                bar: Symbol("bar"),
                baz: Symbol("baz"),
            };

            type IFoo = {
                array: number[];
            };
            type IBar = [number];
            type IBaz = number;

            function fooFactory(bar: IBar): IFoo {
                return {
                    array: bar,
                };
            }
            function barFactory(baz: number): IBar {
                return [baz];
            }
            function bazFactory(): IBaz {
                return 1;
            }
            dic.register(
                {
                    abstraction: TYPES.foo,
                    dependencies: [TYPES.bar],
                    factory: fooFactory,
                    lifeCycle: "transient",
                },
                {
                    intercept: [
                        (_) => {
                            const { concretion: v } = _;
                            v.array.unshift(0);
                            v.array.push(2);
                            return v;
                        },
                    ],
                }
            );

            dic.register({
                abstraction: TYPES.bar,
                dependencies: [TYPES.baz],
                factory: barFactory,
                lifeCycle: "singleton",
            });

            dic.register({
                abstraction: TYPES.baz,
                factory: bazFactory,
                dependencies: [],
                lifeCycle: "singleton",
            });

            const res = dic.get({ abstraction: TYPES.foo });
            expect(res).toEqual({
                array: [0, 1, 2],
            });
        });
    });
    describe(Dic.prototype.clearMemoizationTable.name, () => {
        it("clears the memoization table", () => {
            const dic = new Dic();
            function myFactory() {
                return {};
            }
            const TYPES = {
                my: Symbol("my"),
            };
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "singleton",
            });

            const valueBeforeClearTable = dic.get({ abstraction: TYPES.my });
            dic.clearMemoizationTable();
            const valueAfterClearTable = dic.get({ abstraction: TYPES.my });

            expect(valueBeforeClearTable).not.toBe(valueAfterClearTable);
        });
    });
});
