import { ReactNode, createContext, useState } from "react";

import { ResponseContext as ResponseContextType } from "@/types";

export const ResponseContext = createContext<ResponseContextType>({} as ResponseContextType);

export function ResponseContextProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'success' | 'failure' | null>(null);

  return (
    <ResponseContext.Provider value={{ status, setStatus }}>
      {children}
    </ResponseContext.Provider>
  )
}