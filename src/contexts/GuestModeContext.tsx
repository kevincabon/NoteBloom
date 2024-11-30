import React, { createContext, useContext, useEffect, useState } from "react";
import { Note } from "@/types/note";

interface GuestModeContextType {
  isGuestMode: boolean;
  setIsGuestMode: (value: boolean) => void;
  guestNotes: Note[];
  addGuestNote: (note: Omit<Note, "id" | "created_at" | "updated_at">) => void;
  updateGuestNote: (note: Note) => void;
  deleteGuestNote: (id: string) => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export const GuestModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestNotes, setGuestNotes] = useState<Note[]>([]);

  useEffect(() => {
    const storedNotes = localStorage.getItem("guestNotes");
    if (storedNotes) {
      setGuestNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("guestNotes", JSON.stringify(guestNotes));
  }, [guestNotes]);

  const addGuestNote = (note: Omit<Note, "id" | "created_at" | "updated_at">) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGuestNotes((prev) => [newNote, ...prev]);
  };

  const updateGuestNote = (updatedNote: Note) => {
    setGuestNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id
          ? { ...updatedNote, updated_at: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteGuestNote = (id: string) => {
    setGuestNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <GuestModeContext.Provider
      value={{
        isGuestMode,
        setIsGuestMode,
        guestNotes,
        addGuestNote,
        updateGuestNote,
        deleteGuestNote,
      }}
    >
      {children}
    </GuestModeContext.Provider>
  );
};

export const useGuestMode = () => {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error("useGuestMode must be used within a GuestModeProvider");
  }
  return context;
};