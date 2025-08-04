import { useState } from "react";
import { PhoneOutgoing, Pencil, Trash2 } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import CallKhalaDialog from "./CallKhalaDialog";

export function PhoneNumberManager({ phoneNumbers, setPhoneNumbers, fetchPhoneNumbers, isAdmin }) {
  const [newPhone, setNewPhone] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddPhone = async () => {
    if (!newPhone.trim()) return;
    try {
      const phoneDocRef = doc(db, "phones", newPhone);
      await setDoc(phoneDocRef, { number: newPhone });
      setPhoneNumbers([...phoneNumbers, { id: newPhone, number: newPhone }]);
      setNewPhone("");
      fetchPhoneNumbers();
    } catch (error) {
      // Minimal error handling as this is non-critical
    }
  };

  const handleDeletePhone = async (phoneId) => {
    try {
      await deleteDoc(doc(db, "phones", phoneId));
      setPhoneNumbers(phoneNumbers.filter((phone) => phone.id !== phoneId));
    } catch (error) {
      // Minimal error handling as this is non-critical
    }
  };

  return (
    <SidebarMenuItem key="call-khala">
      <SidebarMenuButton asChild>
        <div className="flex items-center justify-between w-full">
          <CallKhalaDialog phoneNumbers={phoneNumbers} />
          {isAdmin && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl rounded-2xl p-0 overflow-hidden mx-4 sm:mx-0">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 sm:p-6 text-white">
                  <DialogHeader className="items-start text-left space-y-2">
                    <div className="bg-indigo-500 rounded-full p-2 inline-flex mb-1 shadow-md">
                      <Pencil className="h-5 w-5 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-white">Manage Phone Numbers</DialogTitle>
                    <DialogDescription className="text-indigo-100 text-sm">
                      Add, view, or remove phone numbers that can be used to call Khala.
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <Input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm h-10"
                      />
                      <Button 
                        onClick={handleAddPhone}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-4 transition-colors"
                      >
                        Add Number
                      </Button>
                    </div>
                    <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm">
                      {phoneNumbers.length > 0 ? (
                        phoneNumbers.map((phone, idx) => (
                          <div key={phone.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                                {idx + 1}
                              </div>
                              <span className="text-gray-800 font-medium">{phone.number}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePhone(phone.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          <p className="text-sm">No phone numbers added yet</p>
                          <p className="text-xs text-gray-400 mt-1">Add a number using the form above</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default PhoneNumberManager;