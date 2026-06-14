import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Iqra Room Booking to request and manage your room reservations.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center font-medium">
            <div className="flex size-10 items-center justify-center">
              <Image src="/ptta.png" alt="Perpustakaan Tunku Tun Aminah" width={40} height={40} className="size-full object-contain" />
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/ptta-uthm.jpg"
          alt="Perpustakaan Tunku Tun Aminah"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
