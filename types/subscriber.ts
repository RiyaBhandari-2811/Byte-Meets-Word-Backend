export interface ISubscriber {
  email: string;
  verified: boolean;
  verifyToken?: string | null;
  verifyTokenExpiry?: Date | null;
  unsubToken?: string;
  unsubTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
