import { FC } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';

import { useDispatch, useStore } from '../../store';

const langs = [
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

const LanguageControls: FC = () => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (event: SelectChangeEvent) => {
        dispatch({ type: 'lang', payload: event.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <InputLabel id="Language-label">Language</InputLabel>
                <Select
                    labelId="Language-label"
                    fullWidth
                    label="Language"
                    onChange={handleChange}
                    value={state.lang}
                >
                    {
                        langs.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
        </ListItem>
    );
};

export default LanguageControls;
