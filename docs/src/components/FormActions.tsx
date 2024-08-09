import React from 'react';
import { Button, Form, FormInstance } from '@ok/okd';

import ButtonActions from './ButtonActions';
import {
  TradeTypeItem,
  ThemeItem,
  LanguageItem,
  ChainConfigItem,
  ProviderConfigItem,
  CommissionItem,
  TokenPairItem,
} from './FormItem';
import styles from './index.module.less';

const FormActions = ({
  form,
  onRenderWidget,
  onNormalConnectWallet,
  onNeedUpdateParams,
}: {
  form: FormInstance;
  onRenderWidget: () => void;
  onNormalConnectWallet: () => void;
  onNeedUpdateParams: () => void;
}) => {
  return (
    <div className={styles.form}>
      <ButtonActions
        onNormalConnectWallet={onNormalConnectWallet}
        onRenderWidget={onRenderWidget}
      />
      <Form
        form={form}
        onValuesChange={(changedValues) => {
          const { name } = changedValues;
          if (['theme', 'lang'].includes(name)) {
            onNeedUpdateParams();
          }
        }}
      >
        <TradeTypeItem />
        <ThemeItem />
        <LanguageItem />
        <ChainConfigItem />
        <ProviderConfigItem onNormalConnectWallet={onNormalConnectWallet} />
        <CommissionItem />
        <TokenPairItem />
      </Form>
    </div>
  );
};

export default FormActions;
