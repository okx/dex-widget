/* eslint-disable */
import React from 'react';
import { Button, Form, Select } from '@ok/okd';

const providers = [
  {
    label: 'EVM - metamask wallet',
    value: 'evm-metamask',
  },
  {
    label: 'EVM - okx wallet',
    value: 'evm-okxwallet',
  },
  {
    label: 'Solana - okx wallet',
    value: 'solana-okxwallet',
  },
  {
    label: 'Solana - solana wallet',
    value: 'solana-solanawallet',
  },
];
export const ProviderConfigItem = ({ onNormalConnectWallet }) => {
  const options = providers.map((provider) => ({
    label: provider.label,
    value: provider.value,
  }));
  return (
    <div className='flex items-center'>
      <Form.Item label="Provider" name="provider" initialValue={'evm-okxwallet'}>
        <Select searchable={false} options={options} />
      </Form.Item>
      <Button className="ml-10" onClick={onNormalConnectWallet}>
        直连钱包（需要先断开rainbow连接）
      </Button>
    </div>
  );
};
