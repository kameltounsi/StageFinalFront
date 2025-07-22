import {User} from "../user/user.types";

export interface AuthResponse {
    token: string;  // ✅ Pas token
    user: User;
}
