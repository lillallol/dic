import { getIndexOfFirstDuplicateValueOfArray } from "./getIndexOfFirstDuplicateValueOfArray";

describe(getIndexOfFirstDuplicateValueOfArray.name, () => {
    it.each<
        [
            {
                array: unknown[];
                toBe: number;
            }
        ]
    >([
        [
            {
                array: [3, 3],
                toBe: 0,
            },
        ],
        [
            {
                array: [1, 3, 3],
                toBe: 1,
            },
        ],
        [
            {
                array: [1, 3, 3, 4],
                toBe: 1,
            },
        ],
        [
            {
                array: [1, 2, 3, 3],
                toBe: 2,
            },
        ],
        [
            {
                array: [1, 2, 3, 4, 5, 3],
                toBe: 2,
            },
        ],
        [
            {
                array: [1, 2, 3, 4, 3, 5],
                toBe: 2,
            },
        ],
    ])("returns the index of the first duplicated element it finds", ({ array, toBe }) => {
        expect(getIndexOfFirstDuplicateValueOfArray({ array })).toBe(toBe);
    });
    it.each<
        [
            {
                array: unknown[];
            }
        ]
    >([
        [
            {
                array: [],
            },
        ],
        [
            {
                array: [1],
            },
        ],
        [
            {
                array: [1, 2],
            },
        ],
        [
            {
                array: [1, 2, 3],
            },
        ],
        [
            {
                array: [1, 2, 3, 4],
            },
        ],
    ])("returns -1 if there are no duplicate elements in the provided array", ({ array }) => {
        expect(getIndexOfFirstDuplicateValueOfArray({ array })).toBe(-1);
    });
});
