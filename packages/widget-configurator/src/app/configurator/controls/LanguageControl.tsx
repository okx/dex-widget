import { Dispatch, SetStateAction } from 'react';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

const langs: Array<string> = [
    'en_us',
    'zh_cn',
    'zh_tw',
    'nl_nl',
    'fr_fr',
    'id_id',
    'ru_ru',
    'tr_tr',
    'vi_vn',
    'de_de',
    'it_it',
    'pl_pl',
    'pt_pt',
    'pt_br',
    'es_es',
    'es_419',
    'cs_cz',
    'ro_ro',
    'uk_ua',
    'ar_eh',
    'unknown',
];

const lable = 'Language';

export const LanguageControl = ({ state, widgetHandler, params }: { state: [string, Dispatch<SetStateAction<string>>], widgetHandler: any, params: any }) => {
    const [lang, dispatch] = state;
    return (
        <FormControl fullWidth sx={{ width: '100%' }} >
            <InputLabel id="Language-label">{lable}</InputLabel>
            <Select
                labelId="Language-label"
                fullWidth
                label={lable}
                onChange={(event) => {
                    const lang = event.target.value;
                    dispatch(lang);
                    setTimeout(() => {
                        widgetHandler.current?.updateParams({ ...params, lang });
                    })
                }}
                value={lang}
                size="small"
            >
                {
                    langs.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    );
};
