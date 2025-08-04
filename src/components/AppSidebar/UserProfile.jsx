import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";
import LoginDialog from "../LoginDialog";

export function UserProfile({ user, updateUserState }) {
  return (
    <div className="p-4 border-t border-gray-200">
      {user ? (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.photoURL} />
            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            Cookies.remove("userLogin");
            updateUserState();
          }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <LoginDialog onAuthChange={updateUserState} />
      )}
    </div>
  );
}

export default UserProfile;