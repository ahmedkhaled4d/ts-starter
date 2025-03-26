import { OrderCreatedEvent, UserRegisteredEvent } from "./types";

// Event Bus: Central event management system
class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Array<(data: unknown) => void>> = new Map();

  private constructor() {}

  // Singleton pattern for event bus
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // Subscribe to an event type
  public subscribe<T>(
    eventType: string,
    callback: (data: T) => void
  ): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscriberList = this.subscribers.get(eventType)!;
    subscriberList.push(callback as (data: unknown) => void);

    // Return unsubscribe function
    return () => {
      const index = subscriberList.indexOf(callback as (data: unknown) => void);
      if (index > -1) {
        subscriberList.splice(index, 1);
      }
    };
  }

  // Publish an event
  public publish(eventType: string, data: unknown): void {
    const subscribers = this.subscribers.get(eventType) || [];
    subscribers.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
  }
}

// Domain Services
class UserService {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  registerUser(email: string): string {
    const userId = crypto.randomUUID();

    // Create user registration event
    const event: UserRegisteredEvent = {
      userId,
      email,
      registrationDate: new Date(),
    };

    // Publish event
    this.eventBus.publish("user.registered", event);

    return userId;
  }
}

class NotificationService {
  constructor() {
    const eventBus = EventBus.getInstance();

    // Subscribe to user registration events
    eventBus.subscribe<UserRegisteredEvent>("user.registered", (event) => {
      this.sendWelcomeEmail(event.email);
    });

    // Subscribe to order creation events
    eventBus.subscribe<OrderCreatedEvent>("order.created", (event) => {
      this.sendOrderConfirmation(event.userId, event.orderId);
    });
  }

  private sendWelcomeEmail(email: string): void {
    console.log(`Sending welcome email to ${email}`);
  }

  private sendOrderConfirmation(userId: string, orderId: string): void {
    console.log(
      `Sending order confirmation for order ${orderId} to user ${userId}`
    );
  }
}

class OrderService {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  createOrder(userId: string, items: OrderCreatedEvent["items"]): string {
    const orderId = crypto.randomUUID();
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const event: OrderCreatedEvent = {
      orderId,
      userId,
      total,
      items,
    };

    // Publish order created event
    this.eventBus.publish("order.created", event);

    return orderId;
  }
}

// Example Usage
function main(): void {
  // Initialize services
  const userService = new UserService();
  const orderService = new OrderService();
  new NotificationService(); // Subscribes to events

  // User registration flow
  const userId = userService.registerUser("user@example.com");

  // Order creation flow
  orderService.createOrder(userId, [
    { productId: "prod1", quantity: 2, price: 19.99 },
    { productId: "prod2", quantity: 1, price: 49.99 },
  ]);
}

// Run the example
main();

export { EventBus, UserService, OrderService, NotificationService };
