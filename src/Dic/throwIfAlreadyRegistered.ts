import { errorMessages } from "../errorMessages";
import { registry } from "../types";
/**
 * @description
 * Throws error if the provided abstraction is already registered in the provided registry.
 */
export function throwIfAlreadyRegistered(abstraction: symbol, registry: registry): void {
    if (registry.get(abstraction) !== undefined) throw Error(errorMessages.abstractionAlreadyRegistered(abstraction));
}
