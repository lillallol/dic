import { logAndError } from "../es-utils/logAndError";
import type { abstraction, registration, registry } from "../types";

/**
 * @description
 * Returns the registration of the provided abstraction but throws if it does not exist.
 */
export function getRegistrationOf(registry: registry, abstraction: abstraction): registration {
    const registration = registry.get(abstraction);
    if (registration === undefined) {
        logAndError(_errorMessages.abstractionNotRegisteredToDic(abstraction));
    }
    return registration;
}

export const _errorMessages = {
    abstractionNotRegisteredToDic: (abstraction: abstraction): unknown[] => [
        "Provided abstraction with name :",
        abstraction,
        "is not registered to the dic.",
    ],
};
