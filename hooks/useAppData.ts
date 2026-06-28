import { useEffect, useState } from 'react';
import { AppData } from '../types';
import { getAppData, setAppData } from '../utils/storage';

export function useAppData() {
  const [data, setDataState] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppData().then(value => {
      setDataState(value);
      setLoading(false);
    });
  }, []);

  const setData = async (next: AppData) => {
    setDataState(next);
    await setAppData(next);
  };

  return { data, setData, loading };
}
