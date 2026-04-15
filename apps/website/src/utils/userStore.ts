import type { User } from "@pet-u/firebase-config";
// UserProfile sin lat/lng ni address

// Interfaz para tipo de datos de mascota
export interface PetData {
  id: string;
  name: string;
  size: "chica" | "mediana" | "grande" | "xl";
  type: string;
  notes?: string;
  createdAt?: string;
}

// Interfaz del perfil del usuario
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
}

export interface UserState {
  user: User | null;
  profile: UserProfile | null;
  pets: PetData[];
  loading: boolean;
}

const state: UserState = {
  user: null,
  profile: null,
  pets: [],
  loading: true,
};

type Listener = (state: UserState) => void;
const listeners = new Set<Listener>();

export const userStore = {
  get(): UserState {
    return state;
  },

  set(newState: Partial<UserState>) {
    Object.assign(state, newState);
    this.notify();
  },

  setLoading(loading: boolean) {
    state.loading = loading;
    this.notify();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(state); // Enviar el estado inicial inmediatamente
    return () => listeners.delete(listener); // Retornar función de cleanup
  },

  notify() {
    for (const listener of listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error("Error in userStore listener", err);
      }
    }
  },
};
