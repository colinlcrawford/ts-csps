import * as channel from "../src/channel";

describe("channel", () => {
  describe("create", () => {
    it("should return a new channel", () => {
      const chan = channel.create<string>();

      expect(channel).toBeDefined();
    });
  });

  describe("send", () => {
    it("should send to a channel without a receiver waiting", () => {
      const chan = channel.create<string>();

      return expect(channel.send(chan)("hi!")).resolves.toBe(true);
    });

    it("should send to a channel with a receiver waiting", () => {
      const chan = channel.create<string>();

      channel.receive<string>(chan);

      return expect(channel.send(chan)("hi!")).resolves.toBe(true);
    });
  });

  describe("receive", () => {
    it("should return the value sent by send", async () => {
      const message = "hi!";
      const chan = channel.create<string>();

      const receivedValue = channel.receive<string>(chan);
      await channel.send(chan)(message);

      return expect(receivedValue).resolves.toEqual(message);
    });

    it("should receive  messages in the order they are sent to the channel", async () => {
      const messages = Array(5).fill(0).map((_: any, i: number) => `${i}`);
      const chan = channel.create<string>();

      messages.forEach((message) => { channel.send(chan)(message); });

      const results = await Promise.all(messages.map((_: any) => channel.receive(chan)));
      expect(results).toEqual(messages);
    });
  });

  describe("receiveStream", () => {
    it("should keep receiving values as they are added to the channel", async () => {
      const messages = Array(5).fill(0).map((_: any, i: number) => `${i}`);
      const chan = channel.create<string>();
      await Promise.all(messages.map((message) => channel.send(chan)(message)));

      const receivedMessages = [];
      for await (const value of channel.receiveStream(chan)) {
        receivedMessages.push(value);
        if (receivedMessages.length === messages.length) {
          break;
        }
      }

      return expect(receivedMessages).toMatchObject(messages);
    });
  });
});
