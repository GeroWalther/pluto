interface AccountSettings {
  icon: string;
  logo: string;
  primary_color: string;
  secondary_color: string;
  card_issuing: {
    tos_acceptance: {
      date: string;
      ip: string;
    };
  };
  card_payments: {
    decline_on: {
      avs_failure: boolean;
      cvc_failure: boolean;
    };
    statement_descriptor_prefix: string;
    statement_descriptor_prefix_kana: string;
    statement_descriptor_prefix_kanji: string;
  };
  dashboard: {
    display_name: string;
    timezone: string;
  };
  invoices: {
    default_account_tax_ids: string;
  };
  payments: {
    statement_descriptor: string;
    statement_descriptor_kana: string;
    statement_descriptor_kanji: string;
  };
  payouts: {
    debit_negative_balances: boolean;
    schedule: {
      delay_days: number;
      interval: string;
    };
    statement_descriptor: string;
  };
  sepa_debit_payments: {};
}
