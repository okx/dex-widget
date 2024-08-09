/* eslint-disable */
import React from 'react';
import { Form, Select, SelectProps } from '@ok/okd';
import { THEME } from '@src/dapp/bridge/src/lib';

export const ThemeItem = () => {
  return (
    <Form.Item label="Theme" name="theme" initialValue={THEME.LIGHT}>
      <Select
        searchable={false}
        options={[
          {
            label: THEME.DARK,
            value: THEME.DARK,
          },
          {
            label: THEME.LIGHT,
            value: THEME.LIGHT,
          },
        ]}
      />
    </Form.Item>
  );
};
