import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import { Dic } from "./Dic";
import { getRegistrationOf, _errorMessages } from "./getRegistrationOf";

let dic: Dic;

beforeEach(() => {
    dic = new Dic();
    dic.clearMemoizationTable();
});

describe(Dic.name, () => {
    describe(Dic.prototype.register.name, () => {
        // so I use DI in this project to test the following part that I have not tested and commented it away?
        // it.todo("calls validateAbstraction with the appropriate parameters", () => {
        //     //
        // });
        // it.todo("calls validateDependencies with the appropriate parameters", () => {
        //     //
        // });
        // it.todo("calls validateLifeCycle with the appropriate parameters", () => {
        //     //
        // });
        // it.todo("calls validateExtra with the appropriate parameters", () => {
        //     //
        // });
        // it.todo("calls throwIfAlreadyRegistered with the appropriate parameters", () => {
        //     //
        // });
        // it.todo("calls isFactory with the appropriate parameters", () => {
        //     //
        // });
        it("registers in the registry", () => {
            const TYPES = {
                foo: Symbol("foo"),
                bar: Symbol("bar"),
                baz: Symbol("baz"),
            };

            function fooFactory(bar: () => undefined, baz: () => undefined): string {
                return String(bar()) + String(baz());
            }
            const abstraction = TYPES.foo;
            const dependencies = [TYPES.bar, TYPES.baz];
            const factory = fooFactory;
            const lifeCycle = "singleton";
            const intercept = [
                (_: { concretion: string }): string => {
                    const { concretion } = _;
                    return concretion;
                },
            ];
            dic.register({ abstraction, dependencies, factory, lifeCycle, intercept });

            expect(dic._registry.get(TYPES.foo)).toEqual({
                abstraction,
                dependencies,
                factory,
                lifeCycle,
                intercept,
                hasBeenMemoized: false,
            });
        });
    });
    describe(Dic.prototype.unregister.name, () => {
        it("un-registers the provided abstraction from the registry", () => {
            function myFactory() {
                //
            }
            const TYPES = {
                my: Symbol(),
            };
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "singleton",
            });
            dic.unregister({ abstraction: TYPES.my });
            expect(() => dic.get({ abstraction: TYPES.my })).toThrow();
        });
        it("works when the unregistered abstraction that is dependency to other factories, gets registered again", () => {
            const TYPES = {
                top: Symbol("top"),
                left: Symbol("left"),
                right: Symbol("right"),
                bottom: Symbol("bottom"),
            };
            type ILeft = () => number;
            type IRight = () => number;
            type ITop = () => number;
            type IBottom = () => number;
            dic.register({
                abstraction: TYPES.top,
                dependencies: [TYPES.left, TYPES.right],
                factory: (left: ILeft, right: IRight): ITop => () => left() + right(),
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.left,
                dependencies: [],
                factory: (): ILeft => () => -1,
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.right,
                dependencies: [TYPES.bottom],
                factory: (bottom: IBottom): IRight => () => bottom(),
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.bottom,
                dependencies: [],
                factory: (): IBottom => () => +1,
                lifeCycle: "singleton",
            });
            dic.unregister({
                abstraction: TYPES.bottom,
            });
            expect(() => dic.get({ abstraction: TYPES.bottom })).toThrow(
                arrayToErrorMessage(_errorMessages.abstractionNotRegisteredToDic(TYPES.bottom))
            );
            dic.register({
                abstraction: TYPES.bottom,
                dependencies: [],
                factory: (): IBottom => () => +2,
                lifeCycle: "singleton",
            });

            expect(
                dic.get<ITop>({
                    abstraction: TYPES.top,
                })()
            ).toBe(1);
        });
    });
    describe(Dic.prototype.clearMemoizationTable.name, () => {
        it("clears the memoization table", () => {
            function myFactory() {
                //
            }
            const TYPES = {
                my: Symbol(),
            };
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "singleton",
            });

            dic.get({ abstraction: TYPES.my });
            expect([...dic._memoizationTable.entries()].length).toBe(1);
            dic.clearMemoizationTable();
            expect([...dic._memoizationTable.entries()].length).toBe(0);
        });
        it("makes all registration have false for have been memoized", () => {
            function fooFactory() {
                return undefined;
            }
            const TYPES = {
                foo: Symbol("foo"),
            };
            dic.register({
                abstraction: TYPES.foo,
                dependencies: [],
                factory: fooFactory,
                lifeCycle: "singleton",
            });
            dic.get({ abstraction: TYPES.foo });
            const registration = getRegistrationOf(dic._registry, TYPES.foo);
            expect(registration.hasBeenMemoized).toBe(true);
            dic.clearMemoizationTable();
            expect(registration.hasBeenMemoized).toBe(false);
        });
    });
    describe(Dic.prototype.get.name, () => {
        it("memoizes the result of the factory for singleton scope, when it is get-ed", () => {
            const TYPES = {
                my: Symbol("foo"),
            };
            const myFactoryReturnValue = {};
            function myFactory() {
                return myFactoryReturnValue;
            }
            dic.register({
                abstraction: TYPES.my,
                dependencies: [],
                factory: myFactory,
                lifeCycle: "singleton",
            });
            expect(dic.get({ abstraction: TYPES.my })).toBe(dic.get({ abstraction: TYPES.my }));
            expect(dic.get({ abstraction: TYPES.my })).toBe(dic.get({ abstraction: TYPES.my }));
            expect(dic.get({ abstraction: TYPES.my })).toBe(myFactoryReturnValue);
        });
        it("does not memoize the result of the factory for transient scope, when it is get-ed", () => {
            const TYPES = {
                foo: Symbol("foo"),
            };
            const fooReturnValue = 1;
            function fooFactory() {
                return fooReturnValue;
            }
            dic.register({
                abstraction: TYPES.foo,
                dependencies: [],
                factory: fooFactory,
                lifeCycle: "transient",
            });
            dic.get({ abstraction: TYPES.foo });
            expect(dic._memoizationTable.get(TYPES.foo)).toBeUndefined();
        });
        it("wraps the get value with the function provided by intercept", () => {
            const TYPES = {
                foo: Symbol("foo"),
            };
            const array: number[] = [];
            const returnedValue = 1;
            function fooFactory() {
                return () => {
                    array.push(1);
                    return returnedValue;
                };
            }
            dic.register({
                abstraction: TYPES.foo,
                dependencies: [],
                factory: fooFactory,
                lifeCycle: "transient",
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
            });
            expect(
                dic.get<ReturnType<typeof fooFactory>>({ abstraction: TYPES.foo })()
            ).toBe(returnedValue);
            expect(array).toEqual([0, 1, 2]);
        });
        it("manually injects the provided concretions of inject, when it resolves the dependency graph to concretions", () => {
            const TYPES = {
                top: Symbol("top"),
                left: Symbol("left"),
                right: Symbol("right"),
                bottom: Symbol("bottom"),
            };
            type ILeft = () => number;
            type IRight = () => number;
            type ITop = () => number;
            type IBottom = () => number;
            dic.register({
                abstraction: TYPES.top,
                dependencies: [TYPES.left, TYPES.right],
                factory: (left: ILeft, right: IRight): ITop => () => left() + right(),
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.left,
                dependencies: [],
                factory: (): ILeft => () => -1,
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.right,
                dependencies: [TYPES.bottom],
                factory: (bottom: IBottom): IRight => () => bottom(),
                lifeCycle: "singleton",
            });
            dic.register({
                abstraction: TYPES.bottom,
                dependencies: [],
                factory: (): IBottom => () => +1,
                lifeCycle: "singleton",
            });
            expect(
                dic.get<ITop>({
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

            dic.register({
                abstraction: TYPES.foo,
                dependencies: [TYPES.bar],
                factory: fooFactory,
                lifeCycle: "transient",
                intercept: [
                    (_) => {
                        const { concretion: v } = _;
                        v.array.unshift(0);
                        v.array.push(2);
                        return v;
                    },
                ],
            });

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
});
