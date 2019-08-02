/**
 * Implement the subscribe-publish event bus model base on Rx.js
 */
import {
  Observable as RxObservable,
  Subject as RxSubject,
  Subscription as RxSubscription
} from 'rxjs';

import { filter as RxFilter, map as RxMap } from 'rxjs/operators';

/**
 * Define the event message
 *
 * @export
 */
export interface EventMessage {
  key: string;
  data?: any;
}

/**
 * The subscribe option to control some behaviour, such as immediate calling or async calling
 *
 * TODO: Not finished
 *
 * @export
 */
export interface SubscriptionOption {
  setImmediate: boolean;
  setTimeoutInverval: number;
}

/**
 * The pub-sub event bus in application
 *
 * @export
 */
export class EventManagerRx {

  constructor() {
    this.eventBus = new RxSubject<EventMessage>();
  }

  /**
   * Register to get a Rx.Observable object, then use it to subscribe on an event name
   * This supply more flexbile handling in Observer
   *
   * @param string subject The Event Name
   * @return Observable<TMessage> Rx.Observable object
   * @memberof EventManagerRx
   *
   * Sample: this.eventManager.register<HelloModel>('HelloEvent').subscribe(this.onHelloEvent.bind(this));
   */
  register<TMessage>(subject: string): RxObservable<TMessage> {
    return this.eventBus.asObservable().pipe(
      RxFilter((event) => (event.key === subject)),
      RxMap((event) => event.data as TMessage)
    );
  }

  /**
   * Publish a new data on the event name
   *
   * @param string subject The Event Name
   * @param * [data] The Model Data pass to callback
   * @memberof EventManagerRx
   *
   * Sample: this.eventManager.publish<HelloModel>('HelloEvent', this.helloModel);
   */
  publish<TMessage>(subject: string, data?: TMessage) {
    if (typeof(subject) !== 'string' || !subject.length) {
      throw new Error('The subject must be a string');
    }
    this.eventBus.next({ key: subject, data: data });
  }

  /**
   * Register and Subscribe to an Observable object
   *
   * @param string subject The Model Data pass to callback
   * @param (data?: TMessage) => void callback The Observer's function
   * @param SubscriptionOption [option] Set option for the Rx Observable object, such as schedule strategy
   * @return Subscription Rx Subscription to add, remove, unsubscribe
   * @memberof EventManagerRx
   *
   * Sample: this.eventManager.subscribe<HelloModel>('HelloEvent', this.onHelloEvent.bind(this));
   */
  subscribe<TMessage>(subject: string, callback: (data?: TMessage) => void, option?: SubscriptionOption): RxSubscription {
    // TODO: more handle according to SubscriptionOption
    return this.register<TMessage>(subject).subscribe(callback);
  }

  // private members
  private eventBus: RxSubject<EventMessage>;
}
