export interface iUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  code: string;
  verifyCode: string;
  avatar: string;
  avatarID: string;

  accountNumber: number;
  platformName: string;

  verify: boolean;

  walletBalance: number;

  transactionHistory: Array<{}>;
  purchaseHistory: Array<{}>;
  history: Array<{}>;
}

export interface iWalletTransaction {
  bankAccount: string;
  bankName: string;
  transactionType: string;
  description: string;

  amount: number;

  user: {};
}
