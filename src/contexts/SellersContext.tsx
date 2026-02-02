import { createContext, useContext, ReactNode, useState } from "react";

export interface Seller {
  id: string;
  name: string;
  email?: string;
}

interface SellersContextType {
  sellers: Seller[];
  setSellers: (sellers: Seller[]) => void;
  selectedSeller: Seller | null;
  setSelectedSeller: (seller: Seller | null) => void;
}

const SellersContext = createContext<SellersContextType | undefined>(undefined);

export const SellersProvider = ({ children }: { children: ReactNode }) => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  return (
    <SellersContext.Provider
      value={{
        sellers,
        setSellers,
        selectedSeller,
        setSelectedSeller,
      }}
    >
      {children}
    </SellersContext.Provider>
  );
};

export const useSellers = () => {
  const context = useContext(SellersContext);
  if (context === undefined) {
    throw new Error("useSellers deve ser usado dentro de SellersProvider");
  }
  return context;
};
