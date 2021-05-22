import { IDic } from "./publicApi";

export type registration = IDic["registry"] extends Map<symbol,infer U> ? U : never;
export type registry = IDic["registry"];
export type memoizationTable = IDic["memoizationTable"];