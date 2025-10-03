
import { useState } from 'react';

type UserType = 'client' | 'vendor' | null;

export function useUserType() {
  // For now, we'll use localStorage to determine the user type
  // In a real application, this would come from authentication
  const [userType, setUserType] = useState<UserType>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedType = localStorage.getItem('userType');
        return (savedType as UserType) || 'client'; // Default to 'client'
      }
    } catch (e) {
      console.warn('localStorage unavailable for userType:', e);
    }
    return 'client';
  });

  const updateUserType = (type: UserType) => {
    setUserType(type);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (type) {
          localStorage.setItem('userType', type);
        } else {
          localStorage.removeItem('userType');
        }
      }
    } catch (e) {
      console.warn('Failed to persist userType:', e);
    }
  };

  return { userType, updateUserType };
}
