import { BroadcastError } from "../../errors/BroadcastError";
import { deleteAuthToken } from "../token/deleteAuthToken";

type ChannelEvent = {
  [key: string]: () => void;
};

let authChannel: BroadcastChannel;
let events: ChannelEvent = {
  signOut: () => deleteAuthToken(undefined),
  signIn: () => window.location.reload(),
};

export function initAuthBroadcast(
  onMessage?: (message: MessageEvent<any>) => void
) {
  authChannel = new BroadcastChannel("auth");
  authChannel.onmessage = onMessage || defaultOnMessage;
}

export function getAuthChannel() {
  return authChannel;
}

export function defaultOnMessage(message: MessageEvent<any>) {
  try {
    events[message.data]();
  } catch (error) {
    throw new BroadcastError();
  }
}
