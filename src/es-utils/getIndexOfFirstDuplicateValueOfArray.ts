/**
 * @description
 * It returns the index of the first duplicate value it encounters in the array.
 * It returns `-1` when the array has no duplicates.
 *
 * - time complexity O(n)
 * - space complexity O(n)
 *
 * where n is the length of the provided array.
 */
export function getIndexOfFirstDuplicateValueOfArray(_: { array: unknown[] }): number {
    const { array } = _;
    const map: Map<unknown, number> = new Map();
    for (let i = 0; i < array.length; i++) {
        const v = map.get(array[i]);
        if (v === undefined) {
            map.set(array[i], i);
            continue;
        } else {
            return v;
        }
    }
    return -1;
}
