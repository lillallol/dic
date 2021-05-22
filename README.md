# DIC

## Table of contents

<!--#region toc-->

- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Description](#description)
- [Code coverage](#code-coverage)
- [Examples](#examples)
    - [Composition](#composition)
    - [Manual injection](#manual-injection)
    - [Print dependency graph](#print-dependency-graph)
    - [Dead registrations](#dead-registrations)
    - [Graph cycles](#graph-cycles)
    - [Interception](#interception)
    - [AOP](#aop)
- [Documentation](#documentation)
    - [Concretions](#concretions)
        - [Dic](#----dic)
        - [printDependencyGraph](#----printdependencygraph)
        - [namesFactory](#----namesfactory)
        - [validateDependencyGraph](#----validatedependencygraph)
- [Motivation](#motivation)
- [Acknowledgments](#acknowledgments)
- [Contributing](#contributing)
- [Changelog](#changelog)
    - [2.0.0](#200)
    - [1.1.0](#110)
    - [1.0.0](#100)
- [License](#license)

<!--#endregion toc-->

## Installation

```bash
npm install @lillallol/dic
```

## Description

A dependency injection container (DIC) with the following characteristics:

-   configuration as code (no auto wiring)
    -   there will be helpful error messages when a registration has missing or extra dependencies
-   only factory (i.e. functions) registrations
-   singleton and transient lifecycle (no scoped lifecycle)
-   interception at composition
-   ecmascript symbols for interfaces
-   manual injection on object composition
-   state reset for memoized concretions of singleton lifecycle
-   abstraction un-registration

Utility functions are provided that:

-   locate circular loops in the dependency graph
-   find dead registrations and abstractions
-   print the dependency graph

## Code coverage

Testing code coverage is around 90%.

## Examples

### Composition

<!--#region example !./src/examples/composition.test.ts-->

```ts
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

```

<!--#endregion example-->

### Manual injection

<!--#region example !./src/examples/manualInjection.test.ts-->

```ts
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

```

<!--#endregion example-->

### Print dependency graph

<!--#region example !./src/examples/printDependencyGraph.test.ts-->

```ts
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

```

<!--#endregion example-->

### Dead registrations

<!--#region example !./src/examples/deadRegistrations.test.ts-->

```ts
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

```

<!--#endregion example-->

### Graph cycles

<!--#region example !./src/examples/detectCycle.test.ts-->

```ts
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

```

<!--#endregion example-->

### Interception

<!--#region example !./src/examples/interception.test.ts-->

```ts
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

```

<!--#endregion example-->

### AOP

You do aspect oriented programming (AOP), when cross cutting concerns (CCC) are applied in a centralized and DRY way:

<!--#region example !./src/examples/aop.test.ts-->

```ts
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

```

<!--#endregion example-->

## Documentation

<!--#region documentation ./documentation.md-->

<h3 id="-concretions">Concretions</h3>
<h4 id="-concretion-Dic">
    Dic
</h4>

```ts
/**
 * @description
 * Dependency injection container constructor.
 */
export declare const Dic: DicCtor;

```

<details open="">
<summary id="-concretion-Dic-references">
    <a href="#-concretion-Dic-references">#</a>
    references
</summary>

<br>

<blockquote>
<details>
<summary id="-concretion-Dic-references-DicCtor">
    <a href="#-concretion-Dic-references-DicCtor">#</a>
    <b>DicCtor</b>
</summary>
        
```ts
export declare type DicCtor = new () => IDic;
```



</details>
<blockquote>
<details>
<summary id="-concretion-Dic-references-DicCtor-IDic">
    <a href="#-concretion-Dic-references-DicCtor-IDic">#</a>
    <b>IDic</b>
</summary>
        
```ts
export declare type IDic = {
    /**
     * @description
     * Maps abstractions to their corresponding registrations.
     */
    registry: Map<
        symbol,
        {
            abstraction: symbol;
            dependencies: symbol[];
            factory: Function;
            lifeCycle: "singleton" | "transient";
            intercept: ((parameters: { dic: IDic; concretion: any }) => any)[];
        }
    >;
    /**
     * @description
     * All abstractions that have been `get`ed and have singleton lifecycle are
     * memoized in this memoization table.
     */
    memoizationTable: Map<symbol, unknown>;
    /**
     * @description
     * Deletes all the memoized values from the memoization table.
     */
    clearMemoizationTable: () => void;
    /**
     * @description
     * Adds a registration to the dic.
     */
    register: <P extends unknown[], R>(
        arg0: {
            abstraction: symbol;
            dependencies: symbol[];
            factory: (...args: P) => R;
            lifeCycle: "singleton" | "transient";
        },
        arg1?: {
            intercept?: ((parameters: { dic: IDic; concretion: R }) => R)[];
        }
    ) => void;
    /**
     * @description
     * Deletes the registration of the provided abstraction from the registry.
     * It returns `true` if the abstraction registration was found and got
     * deleted, and `false` if it was not found.
     */
    unregister: (parameters: {
        /**
         * @description
         * Abstraction to unregister from the registry.
         */
        abstraction: symbol;
    }) => boolean;
    /**
     * @description
     * Returns the concretion of the provided abstraction.
     */
    get: <T>(parameters: {
        /**
         * @description
         * The abstraction for which you want to get the concretion. Make sure
         * that the symbol is defined with a name (e.g `Symbol("my-name")`) so
         * that more helpful error messages are given.
         */
        abstraction: symbol;
        /**
         * @description
         * Provide manual concretions to be injected when the abstraction
         * dependency graph is composed.
         *
         * The already memoized values override the provided injection values.
         */
        inject?: Map<symbol, unknown>;
    }) => T;
};
```



</details>

</blockquote>
</blockquote>
</details>
<hr>

<h4 id="-concretion-printDependencyGraph">
    printDependencyGraph
</h4>

```ts
/**
 * @description
 * It returns a string representation of the dependency graph starting from the
 * provided abstraction.
 */
export declare const printDependencyGraph: (parameters: {
  dic: IDic;
  rootAbstraction: symbol;
  TYPES: ITYPES;
}) => string;

```

<details open="">
<summary id="-concretion-printDependencyGraph-references">
    <a href="#-concretion-printDependencyGraph-references">#</a>
    references
</summary>

<br>


<blockquote>
<details>
<summary id="-concretion-printDependencyGraph-references-IDic">
    <a href="#-concretion-printDependencyGraph-references-IDic">#</a>
    <b>IDic</b>
</summary>
        
```ts
export declare type IDic = {
    /**
     * @description
     * Maps abstractions to their corresponding registrations.
     */
    registry: Map<
        symbol,
        {
            abstraction: symbol;
            dependencies: symbol[];
            factory: Function;
            lifeCycle: "singleton" | "transient";
            intercept: ((parameters: { dic: IDic; concretion: any }) => any)[];
        }
    >;
    /**
     * @description
     * All abstractions that have been `get`ed and have singleton lifecycle are
     * memoized in this memoization table.
     */
    memoizationTable: Map<symbol, unknown>;
    /**
     * @description
     * Deletes all the memoized values from the memoization table.
     */
    clearMemoizationTable: () => void;
    /**
     * @description
     * Adds a registration to the dic.
     */
    register: <P extends unknown[], R>(
        arg0: {
            abstraction: symbol;
            dependencies: symbol[];
            factory: (...args: P) => R;
            lifeCycle: "singleton" | "transient";
        },
        arg1?: {
            intercept?: ((parameters: { dic: IDic; concretion: R }) => R)[];
        }
    ) => void;
    /**
     * @description
     * Deletes the registration of the provided abstraction from the registry.
     * It returns `true` if the abstraction registration was found and got
     * deleted, and `false` if it was not found.
     */
    unregister: (parameters: {
        /**
         * @description
         * Abstraction to unregister from the registry.
         */
        abstraction: symbol;
    }) => boolean;
    /**
     * @description
     * Returns the concretion of the provided abstraction.
     */
    get: <T>(parameters: {
        /**
         * @description
         * The abstraction for which you want to get the concretion. Make sure
         * that the symbol is defined with a name (e.g `Symbol("my-name")`) so
         * that more helpful error messages are given.
         */
        abstraction: symbol;
        /**
         * @description
         * Provide manual concretions to be injected when the abstraction
         * dependency graph is composed.
         *
         * The already memoized values override the provided injection values.
         */
        inject?: Map<symbol, unknown>;
    }) => T;
};
```



</details>
<details>
<summary id="-concretion-printDependencyGraph-references-ITYPES">
    <a href="#-concretion-printDependencyGraph-references-ITYPES">#</a>
    <b>ITYPES</b>
</summary>
        
```ts
export declare type ITYPES = {
    [x: string]: symbol;
};
```



</details>

</blockquote>
</details>
<hr>

<h4 id="-concretion-namesFactory">
    namesFactory
</h4>

```ts
/**
 * @description
 * Provide `TYPES` to get back an identity function that provides intellisense
 * for the keys of `TYPES`. This function can be used to have refactor-able
 * names in the specification of unit tests.
 */
export declare const namesFactory: <T extends ITYPES>() => <
  N extends keyof T
>(
  name: N
) => N;

```

<details open="">
<summary id="-concretion-namesFactory-references">
    <a href="#-concretion-namesFactory-references">#</a>
    references
</summary>

<br>

<blockquote>
<details>
<summary id="-concretion-namesFactory-references-ITYPES">
    <a href="#-concretion-namesFactory-references-ITYPES">#</a>
    <b>ITYPES</b>
</summary>
        
```ts
export declare type ITYPES = {
    [x: string]: symbol;
};
```



</details>

</blockquote>
</details>
<hr>

<h4 id="-concretion-validateDependencyGraph">
    validateDependencyGraph
</h4>

```ts
/**
 * @description
 * It throws error when:
 *
 * * the dependency graph of the provided entry abstractions
 *   does not use all the registered abstractions
 * * `TYPES` has extra or missing abstractions
 * * there are cycles in the dependency graph
 *
 */
export declare const validateDependencyGraph: (parameters: {
  dic: IDic;
  entryPointAbstractions: symbol[];
  TYPES: ITYPES;
  ignoreAbstractions?: symbol[] | undefined;
}) => void;

```

<details open="">
<summary id="-concretion-validateDependencyGraph-references">
    <a href="#-concretion-validateDependencyGraph-references">#</a>
    references
</summary>

<br>


<blockquote>
<details>
<summary id="-concretion-validateDependencyGraph-references-IDic">
    <a href="#-concretion-validateDependencyGraph-references-IDic">#</a>
    <b>IDic</b>
</summary>
        
```ts
export declare type IDic = {
    /**
     * @description
     * Maps abstractions to their corresponding registrations.
     */
    registry: Map<
        symbol,
        {
            abstraction: symbol;
            dependencies: symbol[];
            factory: Function;
            lifeCycle: "singleton" | "transient";
            intercept: ((parameters: { dic: IDic; concretion: any }) => any)[];
        }
    >;
    /**
     * @description
     * All abstractions that have been `get`ed and have singleton lifecycle are
     * memoized in this memoization table.
     */
    memoizationTable: Map<symbol, unknown>;
    /**
     * @description
     * Deletes all the memoized values from the memoization table.
     */
    clearMemoizationTable: () => void;
    /**
     * @description
     * Adds a registration to the dic.
     */
    register: <P extends unknown[], R>(
        arg0: {
            abstraction: symbol;
            dependencies: symbol[];
            factory: (...args: P) => R;
            lifeCycle: "singleton" | "transient";
        },
        arg1?: {
            intercept?: ((parameters: { dic: IDic; concretion: R }) => R)[];
        }
    ) => void;
    /**
     * @description
     * Deletes the registration of the provided abstraction from the registry.
     * It returns `true` if the abstraction registration was found and got
     * deleted, and `false` if it was not found.
     */
    unregister: (parameters: {
        /**
         * @description
         * Abstraction to unregister from the registry.
         */
        abstraction: symbol;
    }) => boolean;
    /**
     * @description
     * Returns the concretion of the provided abstraction.
     */
    get: <T>(parameters: {
        /**
         * @description
         * The abstraction for which you want to get the concretion. Make sure
         * that the symbol is defined with a name (e.g `Symbol("my-name")`) so
         * that more helpful error messages are given.
         */
        abstraction: symbol;
        /**
         * @description
         * Provide manual concretions to be injected when the abstraction
         * dependency graph is composed.
         *
         * The already memoized values override the provided injection values.
         */
        inject?: Map<symbol, unknown>;
    }) => T;
};
```



</details>
<details>
<summary id="-concretion-validateDependencyGraph-references-ITYPES">
    <a href="#-concretion-validateDependencyGraph-references-ITYPES">#</a>
    <b>ITYPES</b>
</summary>
        
```ts
export declare type ITYPES = {
    [x: string]: symbol;
};
```



</details>

</blockquote>
</details>
<hr>


<!--#endregion documentation-->

## Motivation

Made for learning purposes but ended up using it in my own projects, so I decided to publish it to npm.

## Acknowledgments

The following resources had a detrimental role in the creation of this module:

-   [reliable javascript](https://www.amazon.com/Reliable-JavaScript-Safely-Dangerous-Language/dp/1119028728/ref=sr_1_1?dchild=1&keywords=reliable+javascript&qid=1603887365&sr=8-1)
-   [dependency injection](https://www.amazon.com/Dependency-Injection-Principles-Practices-Patterns/dp/161729473X/ref=sr_1_1?dchild=1&keywords=dependency+injection&qid=1603887468&sr=8-1)

## Contributing

I am open to suggestions/pull request to improve this program.

You will find the following commands useful:

-   Clones the github repository of this project:

    ```bash
    git clone https://github.com/lillallol/dic
    ```

-   Installs the node modules (nothing will work without them):

    ```bash
    npm install
    ```

-   Tests the source code:

    ```bash
    npm run test
    ```

-   Lints the source folder using typescript and eslint:

    ```bash
    npm run lint
    ```

-   Builds the typescript code from the `./src` folder to javascript code in `./dist`:

    ```bash
    npm run build-ts
    ```

-   Injects in place the generated toc and imported files to `README.md`:

    ```bash
    npm run build-md
    ```

-   Checks the project for spelling mistakes:

    ```bash
    npm run spell-check
    ```

    Take a look at the related configuration `./cspell.json`.

-   Checks `./src` for dead typescript files:

    ```bash
    npm run dead-files
    ```

    Take a look at the related configuration `./unimportedrc.json`.

-   Logs in terminal which `dependencies` and `devDependencies` have a new version published in npm:

    ```bash
    npm run check-updates
    ```

-   Updates the `dependencies` and `devDependencies` to their latest version:

    ```bash
    npm run update
    ```

-   Formats all `.ts` files of the `./src` folder:

    ```bash
    npm run format
    ```

## Changelog

### 2.0.0

**breaking changes**

-   Symbols that are used for abstractions have to be defined with a name. For example:

    ```ts
    const TYPES = {
        myAbstraction: Symbol("myAbstraction"),
    };
    ```

    This is done to have more helpful error messages.

-   The `intercept` argument of `dic.get` is now on its own object in a second optional argument. This was done to avoid limitations in type inference:

    **Old**:

    No linting errors for trivial interception:

    ```ts
    dic.register(
        {
            abstraction: Symbol("A"),
            dependencies: [],
            factory: function A(): () => number {
                return (): number => 1;
            },
            lifeCycle: "singleton",
        },
        {
            intercept: [
                ({ concretion }) => {
                    return concretion;
                },
            ],
        }
    );
    ```

    Lints error for non trivial interception:

    ```ts
    dic.register({
        abstraction: Symbol("A"),
        dependencies: [],
        factory: function A(): () => number {
            return (): number => 1;
        },
        lifeCycle: "singleton",
        intercept: [
            ({ concretion }) => {
                // lints error here
                return () => concretion();
            },
        ],
    });
    ```

    **New**:

    No linting errors for non trivial interception:

    ```ts
    dic.get(
        {
            abstraction: Symbol("A"),
            dependencies: [],
            factory: function A(): () => number {
                return (): number => 1;
            },
            lifeCycle: "singleton",
        },
        {
            intercept: [
                ({ concretion }) => {
                    return () => concretion();
                },
            ],
        }
    );
    ```

    notice that `get` now receives two parameters instead of single one.

    [Acknowledgements](https://github.com/microsoft/TypeScript/issues/27212#issuecomment-422908730).

-   `throwIfDeadRegistrations` has been renamed to `validateDependencyGraph`. It now has `TYPES` as required parameter.That is because it finds extra or missing abstractions of `TYPES` object. It also detects circular loops in the dependency graph. Finally you can specify those abstractions that are correctly not used by your entry point abstractions via the parameter `ignoreAbstractions`.

-   `printDependencyTree` has been renamed to `printDependencyGraph`.

-   Factories that are registered have to have a name property that is of non zero length and not equal to string `"factory"`. This is done to have more helpful error messages.

-   The properties `_memoizationTable` and `_registry` of `Dic` instances have been renamed to `memoizationTable` and `registry` respectively.

-   Registrations no longer have property `hasBeenMemoized`.

**Other**

-   Added sections Contributing, Changelog, Code coverage, in `README.md`.
-   Added actual documentation in the Documentation section of `README.md`.

### 1.1.0

**non breaking changes**

-   Added function `throwIfDeadRegistrations` which throws error when there are dead registrations in the dic.

**other**

-   Added `CHANGELOG.md`.

### 1.0.0

-   Published the package.

## License

MIT
