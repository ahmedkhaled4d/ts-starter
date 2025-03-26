// Custom Event Types
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  registrationDate: Date;
}

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
