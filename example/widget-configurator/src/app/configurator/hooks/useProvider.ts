import { getProviderMap } from "../utils/constant";
import { useMemo } from "react";

export const useProvider = (providerStr: string) => {
    return useMemo(() => {
        if (providerStr) {
            const [type, providerFrom] = providerStr?.split('-') || [];
            return getProviderMap()[type]?.[providerFrom];
        }
        return window.ethereum;
    }, [providerStr])
};
