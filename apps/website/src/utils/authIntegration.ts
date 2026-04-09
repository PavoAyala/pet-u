import { auth, db, onAuthStateChanged, collection, getDocs, doc, getDoc } from "@pet-u/firebase-config";
import { userStore, type PetData, type UserProfile } from "./userStore";

let initialized = false;

export function initAuth() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Fetch user profile from firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          address: "",
        };

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          profile = { ...profile, ...data };
        }

        // Fetch pets
        const petsColRef = collection(db, "users", user.uid, "pets");
        const petDocs = await getDocs(petsColRef);
        const pets: PetData[] = [];
        petDocs.forEach((docSnap) => {
          pets.push({ id: docSnap.id, ...docSnap.data() } as PetData);
        });

        userStore.set({ user, profile, pets, loading: false });
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Fallback en caso de que fallen los permisos o no haya red
        userStore.set({ 
          user, 
          profile: { uid: user.uid, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber }, 
          pets: [], 
          loading: false 
        });
      }
    } else {
      userStore.set({ user: null, profile: null, pets: [], loading: false });
    }
  });
}
