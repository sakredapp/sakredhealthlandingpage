import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SiApple } from "react-icons/si";

const APP_STORE_URL = "https://apps.apple.com/us/app/sakred-health/id6756814847";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.sakredunion.app";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DownloadDialogContent({ open, onOpenChange }: DownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FDFBF7] border-[#C5A059]/30">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl font-display text-[#0F172A]">
            Download Sakred Health
          </DialogTitle>
          <DialogDescription className="text-[#0F172A]/60">
            Choose your platform to get started
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-black text-white px-6 py-4 rounded-xl hover:bg-black/90 transition-all hover:-translate-y-0.5 shadow-lg"
            data-testid="dialog-link-app-store"
          >
            <SiApple className="w-10 h-10 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs leading-tight opacity-80">Download on the</p>
              <p className="text-xl font-semibold leading-tight">App Store</p>
            </div>
          </a>

          <a
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-black text-white px-6 py-4 rounded-xl hover:bg-black/90 transition-all hover:-translate-y-0.5 shadow-lg"
            data-testid="dialog-link-google-play"
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current flex-shrink-0">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="text-left">
              <p className="text-xs leading-tight opacity-80">GET IT ON</p>
              <p className="text-xl font-semibold leading-tight">Google Play</p>
            </div>
          </a>
        </div>

        <p className="text-center text-xs text-[#0F172A]/50 mt-2">
          Available on iOS and Android
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function useDownloadDialog() {
  const [open, setOpen] = useState(false);
  return {
    open,
    setOpen,
    openDialog: () => setOpen(true),
    DialogComponent: <DownloadDialogContent open={open} onOpenChange={setOpen} />,
  };
}

export { DownloadDialogContent, APP_STORE_URL, GOOGLE_PLAY_URL };
