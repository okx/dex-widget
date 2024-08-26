import { THEME, ProviderType, TradeType } from '@okxweb3/dex-widget';
import { useContext, createContext, useReducer, FC, ReactNode, Dispatch } from 'react';

const initialState = {
    width: 450,
    theme: THEME.LIGHT,
    tradeType: TradeType.AUTO,
    lang: 'en_us',
    provider: '',
    providerType: ProviderType.EVM,
    chainIds: '',
    baseUrl: 'https://www.okx.com',
    feeConfig: '',
    tokenPair: '',
}
type Action = {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}
const reducer = (state: typeof initialState, action: Action) => {
    switch (action.type) {
        case 'theme':
            return {
                ...state,
                theme: action.payload,
            };
        case 'tradeType':
            return {
                ...state,
                tradeType: action.payload,
            };
        case 'width':
            return {
                ...state,
                width: action.payload,
            };
        case 'provider':
            return {
                ...state,
                provider: action.payload,
            };
        case 'providerType':
            return {
                ...state,
                providerType: action.payload,
            };
        case 'chainIds':
            return {
                ...state,
                chainIds: action.payload,
            };
        case 'baseUrl':
            return {
                ...state,
                baseUrl: action.payload,
            };
        case 'feeConfig':
            return {
                ...state,
                feeConfig: action.payload,
            };
        case 'lang':
            return {
                ...state,
                lang: action.payload,
            };
        case 'tokenPair':
            return {
                ...state,
                tokenPair: action.payload
            }
        default:
            return state;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StoreContext = createContext<{ store: typeof initialState, dispatch: Dispatch<any> } | null>(null);

export const useStore = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return useContext(StoreContext).store;
};

export const useDispatch = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return useContext(StoreContext).dispatch;
}

export const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <StoreContext.Provider value={{ store: state, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
};