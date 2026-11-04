import type { DummyUser } from "../../../auth/core/model";

export type FireUser = Omit<DummyUser, "password">;

