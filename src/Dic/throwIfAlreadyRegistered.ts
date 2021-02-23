import { logAndError } from "../es-utils/logAndError";
import { abstraction, registry } from "../types";

/**
 * @description
 * Throws error if the provided abstraction is already registered in the provided registry.
 */
export function throwIfAlreadyRegistered(abstraction: abstraction, registry: registry): void {
    if (registry.get(abstraction) !== undefined) logAndError(_errorMessages.abstractionAlreadyRegistered(abstraction));
}

export const _errorMessages = {
    abstractionAlreadyRegistered: (abstraction: unknown): unknown[] => [
        "Abstraction",
        abstraction,
        "is already registered",
    ],
};
