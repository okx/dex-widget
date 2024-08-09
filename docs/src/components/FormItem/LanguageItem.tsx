/* eslint-disable */
import React from 'react';
import { Form, Select } from '@ok/okd';
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
export const LanguageItem = () => {
  const options = langs.map((lang) => ({
    label: lang,
    value: lang,
  }));
  return (
    <Form.Item label="Language" name="lang" initialValue={'zh_cn'}>
      <Select searchable={false} options={options} />
    </Form.Item>
  );
};
