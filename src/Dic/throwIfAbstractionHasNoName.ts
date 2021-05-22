import { errorMessages } from "../errorMessages";

export function throwIfAbstractionHasNoName(abstraction: Symbol): void {
    const validAbstractionPattern = /^Symbol\((?<name>.*)\)$/s;

    const name = abstraction.toString().match(validAbstractionPattern)?.groups?.name;

    // const match = abstraction.toString().match(validAbstractionPattern);
    // if (match === null) throw Error(errorMessages.internalLibraryError);
    // const { groups } = match;
    // if (groups === undefined) throw Error(errorMessages.internalLibraryError);
    // const { name } = groups;
    if (name === undefined) throw Error(errorMessages.internalLibraryError);
    if (name === "") throw Error(errorMessages.symbolHasToHaveName);
}
