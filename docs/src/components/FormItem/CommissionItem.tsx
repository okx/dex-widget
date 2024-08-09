/* eslint-disable */
import React from 'react';
import { Form, Input } from '@ok/okd';

export const CommissionItem = () => {
  return (
    <Form.Item label="分佣0-3" name="feeConfig">
      <Input.TextArea
        autoResize
        placeholder={JSON.stringify(
          {
            '1': {
              feePercent: 2,
              referrerAddress: '0x111',
            },
            '501': {
              feePercent: 3,
              referrerAddress: {
                Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
                  account: '0x111',
                  feePercent: 2,
                },
              },
            },
          },
          null,
          4
        )}
      />
    </Form.Item>
  );
};
