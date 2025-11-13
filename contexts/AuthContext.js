'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      // If user not found, automatically create the account
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          // Create user automatically
          await createUserWithEmailAndPassword(auth, email, password);
          toast.success('Account created and logged in successfully!');
          return true;
        } catch (signupError) {
          console.error('Signup error:', signupError.code, signupError.message);
          let errorMessage = 'Failed to create account.';
          if (signupError.code === 'auth/email-already-in-use') {
            // Try login again if account was created
            try {
              await signInWithEmailAndPassword(auth, email, password);
              toast.success('Login successful!');
              return true;
            } catch (retryError) {
              errorMessage = 'Login failed. Please check your password.';
            }
          } else if (signupError.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
          } else if (signupError.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
          } else if (signupError.code === 'auth/operation-not-allowed' || signupError.code === 'auth/configuration-not-found') {
            errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method > Email/Password.';
          }
          toast.error(errorMessage);
          return false;
        }
      } else {
        let errorMessage = 'Login failed. Please check your credentials.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
          errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method > Email/Password.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Login failed: ${error.message || 'Unknown error'}`;
        }
        toast.error(errorMessage);
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

