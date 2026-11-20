import { IUser } from "../../account/users/core/model";

export type AuthUser = Omit<IUser, "password">;
