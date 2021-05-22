import { getFirstOverlappingElementData } from "./getFirstOverlappingElementData";

describe(getFirstOverlappingElementData.name, () => {
    it("returns null when there are not overlapping elements in the provided arrays", () => {
        const array1 = [2, 4, 6];
        const array2 = [1, 3, 5];
        expect(getFirstOverlappingElementData({ array1, array2 })).toBe(null);
    });
    it("returns the index for both arrays and the overlapping element", () => {
        const array1 = [2, 4, 6];
        const array2 = [1, 3, 5, 6];
        expect(getFirstOverlappingElementData({ array1, array2 })).toEqual<
            ReturnType<typeof getFirstOverlappingElementData>
        >({
            index1: 2,
            index2: 3,
            overlappingElement: 6,
        });
    });
});
