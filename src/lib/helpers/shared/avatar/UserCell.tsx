import { ShieldCheck, UserRound } from "lucide-react";
import NoAvatar from "../../../assets/images/no_avatar.jpeg";

type UserCellProps = {
    name?: string;
    avatar?: string | null;
    role?: string;
};

const UserCell: React.FC<UserCellProps> = ({ name, avatar, role }) => {
    const isAdmin = role?.toLowerCase() === "admin";
    const RoleIcon = isAdmin ? ShieldCheck : UserRound;

    return (
        <div className="user-cell">
            <img className="user-cell-avatar" src={avatar || NoAvatar} alt={name} />
            <div className="user-cell-info">
                <span className="user-cell-name">{name}</span>
                <span className={`role-badge ${isAdmin ? "admin" : "viewer"}`}>
                    <RoleIcon size={12} />
                    {role}
                </span>
            </div>
        </div>
    );
};

export default UserCell;