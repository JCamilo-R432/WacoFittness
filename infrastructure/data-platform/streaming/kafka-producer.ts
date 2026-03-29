/**
 * Kafka Event Producer for WacoPro real-time data pipeline.
 * Install: npm install kafkajs
 *
 * Topics:
 *   user-activity-events     — workout.completed, meal.logged, ai.used, wearable.synced
 *   billing-events           — usage.recorded, invoice.created, payment.processed
 *   compliance-events        — audit.logged, control.run, data.exported
 */

// Type-only imports for documentation — kafkajs is optional dep
export interface UserActivityEvent {
  userId: string;
  organizationId?: string;
  type:
    | 'workout.completed'
    | 'meal.logged'
    | 'ai.inference.used'
    | 'wearable.synced'
    | 'user.registered'
    | 'user.subscribed'
    | 'user.churned';
  payload: Record<string, unknown>;
  timestamp: string;
  region?: string;
}

export interface BillingEvent {
  organizationId: string;
  type: 'usage.recorded' | 'invoice.created' | 'payment.processed' | 'dunning.triggered';
  amount?: number;
  currency?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

/**
 * Lightweight Kafka producer wrapper.
 * Falls back to console logging if KAFKA_BROKERS env is not set.
 */
export class WacoProKafkaProducer {
  private producer: unknown = null;
  private connected = false;

  async connect(): Promise<void> {
    if (!process.env.KAFKA_BROKERS) {
      console.log('[Kafka] KAFKA_BROKERS not set — using console fallback');
      return;
    }

    try {
      const { Kafka } = await import('kafkajs' as any);
      const kafka = new Kafka({
        clientId: 'wacopro-backend',
        brokers: process.env.KAFKA_BROKERS.split(','),
        ssl: process.env.KAFKA_SSL === 'true',
        sasl: process.env.KAFKA_SASL_USERNAME
          ? {
              mechanism: 'scram-sha-512',
              username: process.env.KAFKA_SASL_USERNAME,
              password: process.env.KAFKA_SASL_PASSWORD!,
            }
          : undefined,
      });

      this.producer = kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });

      await (this.producer as any).connect();
      this.connected = true;
      console.log('[Kafka] Producer connected to', process.env.KAFKA_BROKERS);
    } catch (err: any) {
      console.warn('[Kafka] Failed to connect:', err.message);
    }
  }

  async emitUserActivity(event: UserActivityEvent): Promise<void> {
    const enriched = {
      ...event,
      metadata: { version: '1.0', source: 'wacopro-backend', region: process.env.REGION || 'us-east-1' },
    };
    await this.send('user-activity-events', event.userId, enriched);
  }

  async emitBillingEvent(event: BillingEvent): Promise<void> {
    await this.send('billing-events', event.organizationId, event);
  }

  private async send(topic: string, key: string, value: unknown): Promise<void> {
    if (!this.connected || !this.producer) {
      // Fallback: log to structured logger
      console.log(JSON.stringify({ kafka_event: { topic, key, value } }));
      return;
    }

    await (this.producer as any).send({
      topic,
      messages: [{
        key,
        value: JSON.stringify(value),
        headers: { 'event-source': 'wacopro-backend', 'schema-version': '1.0' },
      }],
    });
  }

  async disconnect(): Promise<void> {
    if (this.connected && this.producer) {
      await (this.producer as any).disconnect();
    }
  }
}

export const kafkaProducer = new WacoProKafkaProducer();
