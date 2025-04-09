import type WAWebJS from "whatsapp-web.js";

export type WhatsappClientEvent = {
  authenticated: (session?: WAWebJS.ClientSession) => void;
  change_battery: (batteryInfo: WAWebJS.BatteryInfo) => void;
  change_state: (state: WAWebJS.WAState) => void;
  disconnected: (reason: WAWebJS.WAState | "LOGOUT") => void;
  group_join: (notification: WAWebJS.GroupNotification) => void;
  group_leave: (notification: WAWebJS.GroupNotification) => void;
  group_admin_changed: (notification: WAWebJS.GroupNotification) => void;
  group_membership_request: (notification: WAWebJS.GroupNotification) => void;
  group_update: (notification: WAWebJS.GroupNotification) => void;
  contact_changed: (
    message: WAWebJS.Message,
    oldId: string,
    newId: string,
    isContact: boolean
  ) => void;
  media_uploaded: (message: WAWebJS.Message) => void;
  message: (message: WAWebJS.Message) => void;
  message_ack: (message: WAWebJS.Message, ack: WAWebJS.MessageAck) => void;
  message_edit: (message: WAWebJS.Message, newBody: string, prevBody: string) => void;
  unread_count: (chat: WAWebJS.Chat) => void;
  message_create: (message: WAWebJS.Message) => void;
  message_ciphertext: (message: WAWebJS.Message) => void;
  message_revoke_everyone: (message: WAWebJS.Message, revoked_msg?: WAWebJS.Message | null) => void;
  message_revoke_me: (message: WAWebJS.Message) => void;
  message_reaction: (reaction: WAWebJS.Reaction) => void;
  chat_removed: (chat: WAWebJS.Chat) => void;
  chat_archived: (chat: WAWebJS.Chat, currState: boolean, prevState: boolean) => void;
  loading_screen: (percent: string, message: string) => void;
  qr: (qr: string) => void;
  call: (call: WAWebJS.Call) => void;
  ready: () => void;
  remote_session_saved: () => void;
  vote_update: (vote: WAWebJS.PollVote) => void;
};

export type WhatsappClientEventReturn = {
  [K in keyof WhatsappClientEvent]: { type: K; data: Parameters<WhatsappClientEvent[K]> };
}[keyof WhatsappClientEvent];

export const WHATSAPP_CLIENT_EVENTS: Array<keyof WhatsappClientEvent> = [
  "authenticated",
  "change_battery",
  "change_state",
  "disconnected",
  "group_join",
  "group_leave",
  "group_admin_changed",
  "group_membership_request",
  "group_update",
  "contact_changed",
  "media_uploaded",
  "message",
  "message_ack",
  "message_edit",
  "unread_count",
  "message_create",
  "message_ciphertext",
  "message_revoke_everyone",
  "message_revoke_me",
  "message_reaction",
  "chat_removed",
  "chat_archived",
  "loading_screen",
  "qr",
  "call",
  "ready",
  "remote_session_saved",
  "vote_update",
];
