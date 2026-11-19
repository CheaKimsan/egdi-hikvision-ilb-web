import { IUser } from "../../../auth/core/model";

export type FireUser = Omit<IUser, "password">;

