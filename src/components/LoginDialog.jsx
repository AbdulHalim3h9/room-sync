"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function LoginDialog({ onAuthChange }) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginData = Cookies.get("userLogin");
    setIsLoggedIn(!!loginData);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const usersDocRef = doc(db, "users", "allUsers");
      const usersDoc = await getDoc(usersDocRef);

      if (!usersDoc.exists()) {
        setError("No users found in the system");
        return;
      }

      const usersData = usersDoc.data();
      const admins = usersData.admins || {};
      const managers = usersData.managers || {};

      const matchingAdmins = Object.values(admins).filter(user => user.pin === pin);
      const matchingManagers = Object.values(managers).filter(user => user.pin === pin);

      if (matchingAdmins.length === 0 && matchingManagers.length === 0) {
        setError("Invalid PIN");
        return;
      }

      let role, userName;
      if (matchingAdmins.length > 0 && matchingManagers.length > 0) {
        role = "Manager";
        userName = matchingManagers[0].name;
      } else if (matchingAdmins.length > 0) {
        role = "Admin";
        userName = matchingAdmins[0].name;
      } else {
        role = "Manager";
        userName = matchingManagers[0].name;
      }

      const loginData = {
        name: userName,
        role: role,
        timestamp: new Date().toISOString()
      };
      Cookies.set("userLogin", JSON.stringify(loginData), { expires: 7 });

      setPin("");
      setError("");
      setIsLoggedIn(true);
      setIsLoginDialogOpen(false);
      onAuthChange();
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("userLogin");
    setIsLoggedIn(false);
    setIsLoginDialogOpen(false);
    onAuthChange();
  };

  return (
    <div className="flex justify-end px-4 py-2 sm:px-6">
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isLoggedIn ? (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Login
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] w-[90%] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {isLoggedIn ? "Logout" : "Welcome Back!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isLoggedIn 
                ? "You are about to log out of your account. This will end your current session."
                : "Please enter your PIN to access your account."}
            </DialogDescription>
          </DialogHeader>
          {isLoggedIn ? (
            <div className="space-y-4 text-center">
              <p className="text-gray-600">Are you sure you want to logout?</p>
              <Button onClick={handleLogout} className="w-full">
                Yes, Logout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsLoginDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                placeholder="Enter your PIN"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition"
              >
                Login
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginDialog;
