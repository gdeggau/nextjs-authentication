import { ROUTES } from "@constants";
import Router from "next/router";
import { AuthMessage } from "../../constants/broadcast";
import { BroadcastError } from "../../errors/BroadcastError";
import { Values } from "../../types";

type ChannelEvent = {
  [key in Values<typeof AuthMessage>]: () => void;
};

let authChannel: BroadcastChannel;
let events: ChannelEvent = {
  signOut: () => Router.push(ROUTES.home.path),
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
