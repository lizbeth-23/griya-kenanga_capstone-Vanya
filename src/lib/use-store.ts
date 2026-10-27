'use client';

import { useState, useEffect } from 'react';
import { GriyaStore, getDefaultState } from './store';

export function useGriyaStore() {
  const store = GriyaStore.getInstance();
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState(() => getDefaultState());

  useEffect(() => {
    setIsMounted(true);
    setState({ ...store.getState() });

    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return () => unsubscribe();
  }, [store]);

  return {
    state: isMounted ? state : getDefaultState(),
    currentUser: isMounted ? state.currentUser : null,
    isMounted,
    store
  };
}
