"use client"
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";


export function NavbarUser() {
  const { user,logout } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const router = useRouter();


  if (!user) return null;
    const userData = {
      user: {
        name:  user?.fullName || "PharmSync User",
        email: user?.email || "pharmsyn@email.com",
        avatar: "/avatars/shadcn.jpg",
        role: user.role
      },
   }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };



  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none hover:opacity-80 transition-opacity">
        <Avatar className="h-9 w-9 border-2 border-slate-100">
          <AvatarImage src={userData.user.avatar} alt={user.fullName} />
          <AvatarFallback>{userData.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-bold text-slate-900 leading-none">
            {user.fullName}
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1">
            {/* Display Role instead of Email for a cleaner look */}
            {userData.user.role || "System"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mt-2" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground italic">
              {userData.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/account/profile`)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 focus:bg-red-50 focus:text-red-600" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}