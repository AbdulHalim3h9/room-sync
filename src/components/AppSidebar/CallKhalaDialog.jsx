import { useState } from "react";
import { PhoneOutgoing } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CallKhalaDialog({ phoneNumbers }) {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const handleCallKhala = () => {
    if (phoneNumbers.length === 0) {
      alert("No phone numbers available. Please add one.");
    } else if (phoneNumbers.length === 1) {
      window.location.href = `tel:${phoneNumbers[0].number}`;
    } else {
      setIsCallDialogOpen(true);
    }
  };

  const handleCallNumber = (number) => {
    window.location.href = `tel:${number}`;
    setIsCallDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleCallKhala}
        className="flex items-center w-full px-2 py-6 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50"
      >
        <PhoneOutgoing className="mr-2 h-6 w-6" />
        <span className="ml-5 font-medium">Call Khala</span>
      </button>
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="max-w-sm bg-gradient-to-b from-blue-50 to-white border-blue-100 shadow-2xl rounded-2xl p-0 overflow-hidden mx-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6 text-white">
            <DialogHeader className="items-center text-center space-y-2">
              <div className="bg-blue-500 rounded-full p-2 sm:p-3 inline-flex mx-auto mb-2 shadow-lg">
                <PhoneOutgoing className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white">Call Khala</DialogTitle>
              <DialogDescription className="text-blue-100 max-w-xs mx-auto text-xs sm:text-sm">
                Select which Number you would like to use for this call
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {phoneNumbers.length > 0 ? (
                phoneNumbers.map((phone, idx) => (
                  <button
                    key={phone.id}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all hover:bg-blue-50 border border-gray-100 hover:border-blue-200 hover:shadow-md group"
                    onClick={() => handleCallNumber(phone.number)}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                      <span className="text-blue-700 font-semibold text-sm sm:text-base">SIM{idx + 1}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 font-medium text-base sm:text-lg truncate">{phone.number}</p>
                      <p className="text-gray-500 text-xs sm:text-sm">SIM {idx + 1} • Tap to call</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PhoneOutgoing className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <PhoneOutgoing className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm sm:text-base">No phone numbers available</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Please add a phone number first</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CallKhalaDialog;