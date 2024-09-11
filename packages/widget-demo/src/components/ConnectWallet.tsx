import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectWallet = () => {
    return (
        <ConnectButton
          label="Rainbow 连接钱包"
          showBalance={false}
          chainStatus="none"
        />
    )
}

export default ConnectWallet;
