import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "./firebase"
import type { AppUser } from "../features/auth/types"
import type { Automation, CreateAutomationInput } from "../features/automations/types"

const automationsCollection = collection(db, "automations")

export async function createOrUpdateUserProfile(input: {
  uid: string
  email: string
  displayName?: string
}) {
  const userRef = doc(db, "users", input.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: input.uid,
      email: input.email,
      displayName: input.displayName ?? "",
      telegramChatId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  await setDoc(
    userRef,
    {
      uid: input.uid,
      email: input.email,
      displayName: input.displayName ?? "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const userRef = doc(db, "users", uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) return null
  return snapshot.data() as AppUser
}

export async function updateTelegramChatId(uid: string, telegramChatId: string) {
  const userRef = doc(db, "users", uid)

  await updateDoc(userRef, {
    telegramChatId,
    updatedAt: serverTimestamp(),
  })
}

export async function createAutomation(
  input: CreateAutomationInput,
): Promise<string> {
  const docRef = await addDoc(automationsCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getUserAutomations(userId: string): Promise<Automation[]> {
  const q = query(automationsCollection, where("userId", "==", userId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<Automation, "id">),
  }))
}