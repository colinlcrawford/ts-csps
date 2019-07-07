/**
 * Signature
 */

/**
 * A receiver of a message waiting for someone
 * to send a message through the channel
 */
type receiver = (value: any) => void;

/**
 * A channel by which sequential processes can send
 * messages of type T back and forth.
 */
export interface Channel<T> {
  bufferSize: number;
  values: T[];
  receivers: receiver[];
}

/**
 * @param bufferSize - How many items can be accumulated in the channel before sending a message blocks
 */
export type create = <T>(bufferSize?: number) => Channel<T>;

export type receive = <T>(channel: Channel<T>) => Promise<T>;

export type receiveStream = <T>(channel: Channel<T>) => AsyncIterableIterator<T>;

export type send = <T>(channel: Channel<T>) => (value: T) => Promise<boolean>;

/**
 * Implimentation
 */

const channelBufferIsFull: <T>(channel: Channel<T>) => boolean = <T>(channel: Channel<T>) =>
  !!(channel.bufferSize && channel.values.length > channel.bufferSize);

const thereAreWaitingReceivers: <T>(channel: Channel<T>) => boolean =
  <T>(channel: Channel<T>) => !!channel.receivers.length;

export const create: create = <T>(bufferSize: number = 0) => ({
  bufferSize,
  receivers: [],
  values: [],
});

export const send: send = <T>(channel: Channel<T>) => async (value: T) => {
  if (channelBufferIsFull(channel)) { return false; }

  if (thereAreWaitingReceivers(channel)) {
    const waitingReceiver = channel.receivers.shift() as receiver;
    waitingReceiver(value);
    return true;
  }

  channel.values.push(value);
  return true;
};

const channelHasABufferedValue: <T>(channel: Channel<T>) => boolean =
  <T>(channel: Channel<T>) => !!channel.values.length;

export const receive: receive = async <T>(channel: Channel<T>) => {
  if (channelHasABufferedValue(channel)) {
    return channel.values.shift() as T;
  }

  return new Promise((resolve, reject) => {
    const resolveWithValue: receiver = (value: T) => resolve(value);
    channel.receivers.push(resolveWithValue);
  }) as Promise<T>;
};

export const receiveStream: receiveStream = <T>(channel: Channel<T>) => async function*() {
  while (true) {
    const nextValue = await receive(channel);
    yield nextValue;
  }
}();
