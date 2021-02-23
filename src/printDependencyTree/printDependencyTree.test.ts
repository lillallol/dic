import { Dic } from "../Dic/Dic";
import { tagUnindent } from "../es-utils/tagUnindent";
import { printDependencyTree } from "./printDependencyTree";

let dic: Dic;
beforeEach(() => {
    dic = new Dic();
});

describe(printDependencyTree.name, () => {
    it("prints the dependency tree for the abstraction provided", () => {
        const TYPES = {
            value: Symbol(),
            inst: Symbol(),
            fact1: Symbol(),
            fact2_1: Symbol(),
            fact2_2: Symbol(),
            fact3_3: Symbol(),
        };
        type fact2_1 = ReturnType<typeof fact2_1>;
        type fact2_2 = ReturnType<typeof fact2_2>;
        type value = 2;
        type inst = { a: number };
        type Class = { new (): inst };
        type fact3_3 = ReturnType<typeof fact3_3>;
        function fact1(fact2_1: fact2_1, fact2_2: fact2_2) {
            return fact2_1() + fact2_2();
        }
        function fact2_1(value: value, inst: inst) {
            return () => value + inst.a;
        }
        function fact2_2(inst: inst, fact3_3: fact3_3) {
            return () => inst.a + fact3_3();
        }
        const value = () => undefined;
        const Class = () => undefined;
        function fact3_3() {
            return () => 3;
        }

        dic.register({
            abstraction: TYPES.fact1,
            factory: fact1,
            dependencies: [TYPES.fact2_1, TYPES.fact2_2],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact2_1,
            factory: fact2_1,
            dependencies: [TYPES.value, TYPES.inst],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact2_2,
            factory: fact2_2,
            dependencies: [TYPES.inst, TYPES.fact3_3],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.value,
            factory: value,
            dependencies: [],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.inst,
            factory: Class,
            dependencies: [],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact3_3,
            factory: fact3_3,
            dependencies: [],
            lifeCycle: "singleton",
        });

        const receivedString = printDependencyTree({ dic, TYPES: TYPES, rootAbstraction: TYPES.fact1 });
        console.log(receivedString);
        expect(receivedString).toBe(tagUnindent`
            total number of unique components : 6

            fact1
            |_ fact2_1
            |  |_ value
            |  |_ inst
            |_ fact2_2
               |_ inst
               |_ fact3_3
        `);
    });
    it("does not repeat common trees", () => {
        const TYPES = {
            fact1: Symbol(),
            fact2_1: Symbol(),
            fact4_1: Symbol(),
            fact4_2: Symbol(),
            fact3_1: Symbol(),
        };
        type fact2_1 = ReturnType<typeof fact2_1>;
        type fact3_1 = ReturnType<typeof fact3_1>;
        type fact4_1 = ReturnType<typeof fact4_1>;
        type fact4_2 = ReturnType<typeof fact4_2>;
        function fact1(fact2_1: fact2_1, fact3_1: fact3_1) {
            return fact2_1() + fact3_1();
        }
        function fact2_1(fact3_1: fact3_1) {
            return () => fact3_1();
        }
        function fact3_1(fact4_1: fact4_1, fact4_2: fact4_2) {
            return () => fact4_1() + fact4_2();
        }
        function fact4_1() {
            return () => 1;
        }
        function fact4_2() {
            return () => 2;
        }

        dic.register({
            abstraction: TYPES.fact1,
            factory: fact1,
            dependencies: [TYPES.fact2_1, TYPES.fact3_1],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact2_1,
            factory: fact2_1,
            dependencies: [TYPES.fact3_1],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact3_1,
            factory: fact3_1,
            dependencies: [TYPES.fact4_1, TYPES.fact4_2],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact4_1,
            factory: fact4_1,
            dependencies: [],
            lifeCycle: "singleton",
        });
        dic.register({
            abstraction: TYPES.fact4_2,
            factory: fact4_2,
            dependencies: [],
            lifeCycle: "singleton",
        });

        const receivedString = printDependencyTree({ dic, rootAbstraction: TYPES.fact1, TYPES });
        // console.log(receivedString);
        expect(receivedString).toBe(tagUnindent`
            total number of unique components : 5

            fact1
            |_ fact2_1
            |  |_ fact3_1
            |     |_ fact4_1
            |     |_ fact4_2
            |_ fact3_1 <*>
        `);
    });
});
