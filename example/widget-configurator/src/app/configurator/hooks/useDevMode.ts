import { useEffect, useState } from 'react';

let clickNum: number = 0;

const CACHE_KEY = 'dev_mode_is_open';
export const useDevMode = () => {
    const [isDevModeOpen, setIsDevModeOpen] = useState<boolean>(import.meta.env.VITE_APP_ENV !== 'prod');

    useEffect(() => {
        const cacheValue = localStorage.getItem(CACHE_KEY);
        if (cacheValue) {
            setIsDevModeOpen(JSON.parse(cacheValue));
        }
    }, []);

    const openDevMode = () => {
        if (isDevModeOpen) {
            return;
        }
        clickNum++;
        if (clickNum < 3) {
            return;
        }
        setIsDevModeOpen(true);
        localStorage.setItem(CACHE_KEY, 'true');
    };

    return { isDevModeOpen, openDevMode };
}
