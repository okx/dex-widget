/* eslint-disable */

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@ok/okd';

const ButtonActions = ({
  onRenderWidget,
  onNormalConnectWallet,
}: {
  onRenderWidget: () => void;
  onNormalConnectWallet: () => void;
}) => {
  return (
    <div className="flex justify-between mb-20">
      <div className="flex">
        <ConnectButton
          label="Rainbow 连接钱包"
          showBalance={false}
          chainStatus="none"
        />

      </div>
      <Button type={Button.TYPE.green} onClick={onRenderWidget}>
        Render Widget
      </Button>
    </div>
  );
};

export default ButtonActions;
