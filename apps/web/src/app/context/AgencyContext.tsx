'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useEnvironmentContext } from '@/app/context/EnvironmentContext';

export interface AgencyInfo {
  id: string;
  _id?: string;
  name: string;
}

interface PaginatedAgencies {
  data: AgencyInfo[];
}

interface AgencyContextValue {
  agencies: string[];
  agencyObjects: AgencyInfo[];
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  registerAgency: (agency: string | AgencyInfo) => void;
  isLoading: boolean;
}

const AgencyContext = createContext<AgencyContextValue | undefined>(undefined);

export function AgencyProvider({ children }: { children: ReactNode }) {
  const { selectedEnvironmentId } = useEnvironmentContext();
  const [agencyObjects, setAgencyObjects] = useState<AgencyInfo[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!selectedEnvironmentId) {
      setAgencyObjects([]);
      setSelectedAgency('all');
      setIsLoading(false);
      return;
    }

    api
      .get<PaginatedAgencies>(`/agencies?environmentId=${selectedEnvironmentId}`)
      .then((result: PaginatedAgencies) => {
        if (!cancelled) {
          const rows = Array.isArray(result) ? result : result.data ?? [];
          setAgencyObjects(rows.map((agency) => ({
            id: String(agency.id ?? agency._id ?? agency.name),
            _id: agency._id,
            name: agency.name,
          })));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedEnvironmentId]);

  useEffect(() => {
    setSelectedAgency('all');
  }, [selectedEnvironmentId]);

  const agencies = useMemo(() => agencyObjects.map((a) => a.name), [agencyObjects]);

  const registerAgency = (agency: string | AgencyInfo) => {
    const name = typeof agency === 'string' ? agency.trim() : agency.name.trim();
    if (!name) return;
    const id = typeof agency === 'string' ? name : String(agency.id ?? agency._id ?? name);
    setAgencyObjects((prev) => {
      if (prev.some((a) => a.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { id, _id: typeof agency === 'string' ? undefined : agency._id, name }];
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
