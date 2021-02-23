import { logAndError } from "../es-utils/logAndError";

/**
 * @description
 * Throws error if the provided value is not `"singleton"` or `"transient"`.
 */
export function validateLifeCycle(lifeCycle: unknown): void {
    if (lifeCycle !== "singleton" && lifeCycle !== "transient")
        logAndError(_errorMessages.lifeCycleHasToBeSingletonOrTransient(lifeCycle));
}

export const _errorMessages = {
    lifeCycleHasToBeSingletonOrTransient: (lifeCycle: unknown): unknown[] => [
        "Provided life cycle",
        lifeCycle,
        'has to be "singleton" or "factory"',
    ],
};
