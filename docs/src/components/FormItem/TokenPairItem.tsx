/* eslint-disable */
import React from 'react';
import { Form, Input } from '@ok/okd';

export const TokenPairItem = () => {
  return (
    <Form.Item label="TokenPair" name="tokenPair">
      <Input.TextArea
        autoResize
        placeholder={JSON.stringify(
          {
            fromChain: 1,
            toChain: 1,
            fromToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            toToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          },
          null,
          4
        )}
      />
    </Form.Item>
  );
};
