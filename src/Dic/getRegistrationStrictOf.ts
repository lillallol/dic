import { errorMessages } from "../errorMessages";
import type { registration, registry } from "../types";

/**
 * @description
 * Returns the registration of the provided abstraction but throws if it does not exist.
 */
export function getRegistrationStrictOf(registry: registry, abstraction: symbol): registration {
    const registration = registry.get(abstraction);
    if (registration === undefined) {
        throw Error(errorMessages.abstractionNotRegisteredToDic(abstraction));
    }
    return registration;
}
