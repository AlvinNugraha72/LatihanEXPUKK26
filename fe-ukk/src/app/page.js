"use client";

import Image from "next/image";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export default function Home() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 font-sans text-base-content">
      <div className="card w-full max-w-sm shrink-0 bg-base-100 border-2 border-black rounded-none">
        <div className="card-body">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="relative w-32 h-32 mb-2">
                <Image
                 src="/LogoWiraPolos.png"
                 alt="Logo Wira"
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <h2 className="card-title text-2xl font-black uppercase tracking-tight">
              PENGADUAN WIHOPE
            </h2>
            <p className="text-sm opacity-75 font-bold">
              Sign In Untuk Melanjutkan
            </p>
          </div>

          <form action={formAction}>
            {state?.error && (
              <div role="alert" className="alert alert-error mb-4 rounded-none font-bold border-2 border-black">
                <span>{state.error}</span>
              </div>
            )}
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-black uppercase">NIS / Username</span>
              </label>
              <input
                name="identifier"
                type="text"
                placeholder="cth: 1234"
                className="input input-bordered border-2 border-black rounded-none focus:outline-none font-bold bg-gray-50"
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-black uppercase">Password</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="input input-bordered border-2 border-black rounded-none focus:outline-none font-bold bg-gray-50"
                required
              />
            </div>
            
            <div className="form-control mt-6">
              <button 
                  className="btn btn-neutral w-full uppercase font-black tracking-widest rounded-none border-2 border-black hover:bg-black hover:text-white" 
                  disabled={isPending}
              >
                {isPending ? <span className="loading loading-spinner"></span> : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
