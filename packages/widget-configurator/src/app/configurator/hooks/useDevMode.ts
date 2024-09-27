import { useEffect, useState } from 'react';

let clickNum = 0;

const CACHE_KEY = 'dev_mode_is_open';
const isDev = ['aladdin', 'development'].includes(import.meta.env.VITE_APP_ENV);
export const useDevMode = () => {
    const [isDevModeOpen, setIsDevModeOpen] = useState<boolean>(
        isDev
    );

    useEffect(() => {
        const cacheValue = localStorage.getItem(CACHE_KEY);
        if (cacheValue) {
            setIsDevModeOpen(JSON.parse(cacheValue));
        }
    }, []);

    const openDevMode = () => {
        if (isDevModeOpen || !isDev) {
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
};
