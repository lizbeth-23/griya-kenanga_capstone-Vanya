'use client';

import { useState, useEffect } from 'react';
import { GriyaStore } from './store';

export function useGriyaStore() {
  const store = GriyaStore.getInstance();
  const [state, setState] = useState(() => store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return () => unsubscribe();
  }, [store]);

  return {
    state,
    currentUser: state.currentUser,
    store
  };
}
