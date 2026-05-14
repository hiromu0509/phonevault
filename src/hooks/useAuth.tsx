"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AppUser } from "@/types";
import { COLLECTIONS } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string, companyName: string, phone: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            ...data,
            uid: firebaseUser.uid,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          } as AppUser);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const ref = doc(db, COLLECTIONS.USERS, cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: cred.user.email,
        displayName: cred.user.displayName || email.split("@")[0],
        role: "buyer",
        companyName: "",
        phone: "",
        approved: false,
        createdAt: Timestamp.now(),
      });
      await signOut(auth);
      const err = new Error("not-approved") as any;
      err.code = "auth/not-approved";
      throw err;
    } else {
      const data = snap.data();
      if (!data.approved && data.role !== "admin") {
        await signOut(auth);
        const err = new Error("not-approved") as any;
        err.code = "auth/not-approved";
        throw err;
      }
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    companyName: string,
    phone: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, COLLECTIONS.USERS, cred.user.uid), {
      email,
      displayName,
      companyName,
      phone,
      role: "buyer",
      approved: false,
      createdAt: Timestamp.now(),
    });
    await signOut(auth);
  };

  const logout = () => signOut(auth);
  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, register, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}