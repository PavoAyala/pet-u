"use client" 

import React, { useState } from "react";
import { LogIn, Lock, Mail, Loader2 } from "lucide-react";
import { 
  auth, 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from '@pet-u/firebase-config';

const SignIn2 = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
 
  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa correo y contraseña.");
      return;
    }
    if (!validateEmail(email)) {
      setError("El correo electrónico no es válido.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Set persistence based on "Remember Me"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // Success! The auth state change will be handled by the route guard or the page.
      globalThis.location.href = '/productos';
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Credenciales incorrectas. Intenta de nuevo.");
      } else {
        setError("Error al iniciar sesión. Por favor intenta más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfbf7]">
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl shadow-[#3C4F35]/5 p-10 flex flex-col items-center border border-[#3C4F35]/5 text-[#3C4F35]">
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-[#3C4F35] mb-8 shadow-xl shadow-[#3C4F35]/20">
          <img src="/images/logo_circular.png" alt="PET-U" className="w-10 h-10 filter invert brightness-0" />
        </div>
        
        <h2 className="text-3xl font-serif font-bold mb-2 text-center text-[#3C4F35]">
          Panel de Control
        </h2>
        <p className="text-gray-400 text-sm mb-8 text-center font-medium italic">
          Ingresa al exclusivo gestor de inventario PET-U
        </p>

        <div className="w-full flex flex-col gap-4 mb-4">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#3C4F35] transition-colors">
              <Mail className="w-5 h-5" />
            </span>
            <input
              placeholder="Correo electrónico"
              type="email"
              value={email}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:border-[#3C4F35] focus:ring-4 focus:ring-[#3C4F35]/5 bg-[#fdfbf7]/30 text-[#3C4F35] text-sm transition-all"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#3C4F35] transition-colors">
              <Lock className="w-5 h-5" />
            </span>
            <input
              placeholder="Contraseña"
              type="password"
              value={password}
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:border-[#3C4F35] focus:ring-4 focus:ring-[#3C4F35]/5 bg-[#fdfbf7]/30 text-[#3C4F35] text-sm transition-all"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            />
          </div>
          
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#3C4F35] focus:ring-[#3C4F35]"
              />
              <span className="text-xs text-gray-500 font-medium tracking-tight">Recordarme</span>
            </label>
            <button className="text-xs text-[#3C4F35] hover:underline font-bold tracking-tight">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-[#3C4F35] hover:bg-[#2D3B28] text-white font-bold py-5 rounded-3xl shadow-xl shadow-[#3C4F35]/20 hover:shadow-2xl hover:shadow-[#3C4F35]/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Entrar al Boutique
              <LogIn className="w-5 h-5" />
            </>
          )}
        </button>
        
        <div className="mt-10 pt-8 border-t border-dashed border-gray-100 w-full text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
            Acceso Privado • PET-U 2026
          </p>
        </div>
      </div>
    </div>
  );
};
 
export { SignIn2 };
