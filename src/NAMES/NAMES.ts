import { ITYPES } from "../publicApi";

export const namesFactory = function namesFactory<T extends ITYPES>() {
    return <N extends keyof T>(name: N): N => name;
};
