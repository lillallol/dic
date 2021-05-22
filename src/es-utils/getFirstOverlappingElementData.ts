/**
 * @description
 * The `array1` is iterated and each element is checked if it does exist in `array2`.
 * If no common element is found, it returns `null`.
 * If a common element is found, it is returned, together with its index for each array.
 */
export function getFirstOverlappingElementData<T>(_: { array1: T[]; array2: T[] }): {
    /**
     * @description
     * This is the index of the first overlapping element for the first array.
     */
    index1: number;
    /**
     * @description
     * This is the index of the first overlapping element for the second array.
     */
    index2: number;
    overlappingElement: T;
} | null {
    const { array1, array2 } = _;

    const array2Map = new Map(array2.map((value, i) => [value, i]));
    for (let i1 = 0; i1 < array1.length; i1++) {
        const i2 = array2Map.get(array1[i1]);
        if (i2 !== undefined) {
            return {
                index1: i1,
                index2: i2,
                overlappingElement: array1[i1],
            };
        }
    }
    return null;
}
