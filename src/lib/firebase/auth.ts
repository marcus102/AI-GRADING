
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type AuthError,
} from 'firebase/auth';
import { auth } from './config';
import type { AuthFormValues } from '@/lib/schemas';

export const signUpWithEmail = async (values: AuthFormValues): Promise<User | AuthError> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    return userCredential.user;
  } catch (error) {
    return error as AuthError;
  }
};

export const signInWithEmail = async (values: AuthFormValues): Promise<User | AuthError> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    return userCredential.user;
  } catch (error) {
    return error as AuthError;
  }
};

export const signOut = async (): Promise<void | AuthError> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    return error as AuthError;
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
};
