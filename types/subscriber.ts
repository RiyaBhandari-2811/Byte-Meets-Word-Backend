export interface ISubscriber {
  email: string;
  verified: boolean;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  unsubToken?: string;
  unsubTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
