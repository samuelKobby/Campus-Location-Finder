import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Location {
  id: string;
  name: string;
  description: string;
  building: string;
  openingHours: string;
  image: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  getDirections?: () => void;
}

interface LocationContextType {
  academicLocations: Location[];
  diningLocations: Location[];
  healthLocations: Location[];
  libraryLocations: Location[];
  sportsLocations: Location[];
  studentCenterLocations: Location[];
  setAcademicLocations: (locations: Location[]) => void;
  setDiningLocations: (locations: Location[]) => void;
  setHealthLocations: (locations: Location[]) => void;
  setLibraryLocations: (locations: Location[]) => void;
  setSportsLocations: (locations: Location[]) => void;
  setStudentCenterLocations: (locations: Location[]) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [academicLocations, setAcademicLocations] = useState<Location[]>([]);
  const [diningLocations, setDiningLocations] = useState<Location[]>([]);
  const [healthLocations, setHealthLocations] = useState<Location[]>([]);
  const [libraryLocations, setLibraryLocations] = useState<Location[]>([]);
  const [sportsLocations, setSportsLocations] = useState<Location[]>([]);
  const [studentCenterLocations, setStudentCenterLocations] = useState<Location[]>([]);

  return (
    <LocationContext.Provider
      value={{
        academicLocations,
        diningLocations,
        healthLocations,
        libraryLocations,
        sportsLocations,
        studentCenterLocations,
        setAcademicLocations,
        setDiningLocations,
        setHealthLocations,
        setLibraryLocations,
        setSportsLocations,
        setStudentCenterLocations,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocations = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
};
