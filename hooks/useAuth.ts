import { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { isFirebaseConfigured, listenToAuth } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    const unsubscribe = listenToAuth(nextUser => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, configured };
}
