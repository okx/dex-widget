/* eslint-disable */
import React from 'react';
import { Form, Select } from '@ok/okd';
import { TradeType } from '@src/dapp/bridge/src/lib';

export const TradeTypeItem = () => {
  return (
    <Form.Item
      label="Trade Type"
      name="tradeType"
      initialValue={TradeType.AUTO}
    >
      <Select
        searchable={false}
        options={[
          {
            label: TradeType.AUTO,
            value: TradeType.AUTO,
          },
          {
            label: TradeType.BRIDGE,
            value: TradeType.BRIDGE,
          },
          {
            label: TradeType.SWAP,
            value: TradeType.SWAP,
          },
        ]}
      />
    </Form.Item>
  );
};
