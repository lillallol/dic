import { Dic } from "./Dic/Dic";
import { throwIfDeadRegistrations, _errorMessages } from "./throwIfDeadRegistrations";

const dic = new Dic();

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

describe(throwIfDeadRegistrations.name, () => {
    it("throws error when the provided dic has dead registration for the provided entry point abstractions", () => {
        expect(() => throwIfDeadRegistrations({ dic, entryPointAbstractions: [TYPES.foo] })).toThrow(
            _errorMessages.abstractionsAreNotUsed({ entryAbstractions: [TYPES.foo], deadAbstractions: [TYPES.bar] })
        );
    });
    it("does not throw error when the provided dic does not have dead registration for the provided entry point abstractions", () => {
        expect(() => throwIfDeadRegistrations({ dic, entryPointAbstractions: [TYPES.foo, TYPES.bar] })).not.toThrow();
    });
});
