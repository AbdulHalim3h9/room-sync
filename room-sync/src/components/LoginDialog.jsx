// src/components/LoginDialog.js
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function LoginDialog() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="flex justify-end p-4">
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" /> Login
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          {selectedRole ? (
            <div className="space-y-4">
              <p className="text-lg font-medium">Logging in as {selectedRole}</p>
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Button className="w-full">Login</Button>
              <Button variant="outline" className="w-full" onClick={() => setSelectedRole(null)}>
                Back
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <Button className="w-full" onClick={() => setSelectedRole("Manager")}>
                Login as Manager
              </Button>
              <Button className="w-full" onClick={() => setSelectedRole("Admin")}>
                Login as Admin
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginDialog;
