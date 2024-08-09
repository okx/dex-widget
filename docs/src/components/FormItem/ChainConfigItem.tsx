/* eslint-disable */
import React from 'react';
import { Form, Input } from '@ok/okd';

export const ChainConfigItem = () => {
  return (
    <Form.Item label="链配置" name="chainIds">
      <Input placeholder="1,501" />
    </Form.Item>
  );
};
