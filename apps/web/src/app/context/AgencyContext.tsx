'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

export interface AgencyInfo {
  id: string;
  name: string;
}

interface PaginatedAgencies {
  data: AgencyInfo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AgencyContextValue {
  agencies: string[];
  agencyObjects: AgencyInfo[];
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  registerAgency: (agency: string) => void;
  isLoading: boolean;
}

const AgencyContext = createContext<AgencyContextValue | undefined>(undefined);

export function AgencyProvider({ children }: { children: ReactNode }) {
  const [agencyObjects, setAgencyObjects] = useState<AgencyInfo[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get<PaginatedAgencies>('/agencies')
      .then((result: PaginatedAgencies) => {
        if (!cancelled) {
          setAgencyObjects(result.data ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const agencies = useMemo(() => agencyObjects.map((a) => a.name), [agencyObjects]);

  const registerAgency = (agency: string) => {
    const name = agency.trim();
    if (!name) return;
    setAgencyObjects((prev) => {
      if (prev.some((a) => a.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { id: name, name }];
    });
  };

  const value = useMemo(
    () => ({ agencies, agencyObjects, selectedAgency, setSelectedAgency, registerAgency, isLoading }),
    [agencies, agencyObjects, selectedAgency, isLoading]
  );

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>;
}

export function useAgencyContext() {
  const context = useContext(AgencyContext);
  if (!context) throw new Error('useAgencyContext must be used inside AgencyProvider');
  return context;
}
