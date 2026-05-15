import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CanonLayer, CanonSubject } from '../domain/canonDomainModel'
import {
  addLayerToCollections,
  addSubjectToCollections,
  emptyCanonDomainCollections,
  type CanonDomainCollections,
} from '../lib/canonDomainOps'

interface CanonDomainState extends CanonDomainCollections {
  addLayer: (input: { label: string; visibility: CanonLayer['visibility']; id?: string }) => string | null
  addSubject: (input: {
    displayLabel: string
    kind: CanonSubject['kind']
    id?: string
  }) => string | null
  resetToEmpty: () => void
}

export const useCanonDomainStore = create<CanonDomainState>()(
  persist(
    (set, get) => ({
      ...emptyCanonDomainCollections(),
      addLayer: (input) => {
        const result = addLayerToCollections(get(), input)
        if (!result.ok) return result.message
        set(result.collections)
        return null
      },
      addSubject: (input) => {
        const result = addSubjectToCollections(get(), input)
        if (!result.ok) return result.message
        set(result.collections)
        return null
      },
      resetToEmpty: () => set(emptyCanonDomainCollections()),
    }),
    {
      name: 'model-domain-v1',
      partialize: (state) => ({
        layers: state.layers,
        subjects: state.subjects,
        relations: state.relations,
      }),
    },
  ),
)
