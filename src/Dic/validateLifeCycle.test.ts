import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import { validateLifeCycle, _errorMessages } from "./validateLifeCycle";

describe(validateLifeCycle.name, () => {
    it.each([["singleton"], ["transient"]])("does not throw when provided with a valid lifecycle", (lifecycle) => {
        expect(() => validateLifeCycle(lifecycle)).not.toThrow();
    });
    it.each([["apple"], ["pear"]])("throws when provided with a non valid lifecycle", (lifecycle) => {
        expect(() => validateLifeCycle(lifecycle)).toThrow(
            arrayToErrorMessage(_errorMessages.lifeCycleHasToBeSingletonOrTransient(lifecycle))
        );
    });
});
