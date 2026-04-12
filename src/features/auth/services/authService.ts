import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { auth } from "../../../lib/firebase"
import { createOrUpdateUserProfile } from "../../../lib/firestore"

export async function registerWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await createOrUpdateUserProfile({
    uid: user.uid,
    email: user.email ?? email,
    displayName: user.displayName ?? "",
  })

  return user
}

export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await createOrUpdateUserProfile({
    uid: user.uid,
    email: user.email ?? email,
    displayName: user.displayName ?? "",
  })

  return user
}

export async function logout() {
  await signOut(auth)
}