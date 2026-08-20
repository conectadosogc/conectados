export type ActionResponse = { status: "idle" | "success" | "error"; message: string };

export const initialActionResponse: ActionResponse = { status: "idle", message: "" };
