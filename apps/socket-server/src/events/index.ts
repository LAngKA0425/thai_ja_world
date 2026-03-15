export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",

  PLAZA_JOIN: "plaza:join",
  PLAZA_LEAVE: "plaza:leave",
  PLAZA_MOVE: "plaza:move",
  PLAZA_CHAT: "plaza:chat",
  PLAZA_SYSTEM_MESSAGE: "plaza:system_message",
  PLAZA_USER_LIST: "plaza:user_list",

  BROADCAST_SEND: "broadcast:send",
  BROADCAST_RECEIVE: "broadcast:receive",
  BROADCAST_EXPIRE: "broadcast:expire",

  PRESENCE_UPDATE: "presence:update",
  PRESENCE_ONLINE_COUNT: "presence:online_count",
  PRESENCE_USER_STATUS: "presence:user_status",

  USER_PROFILE_CARD_REQUEST: "user:profile_card_request",
  USER_PROFILE_CARD_RESPONSE: "user:profile_card_response",

  NOTIFICATION_SEND: "notification:send",
  NOTIFICATION_RECEIVE: "notification:receive",

  FRIEND_REQUEST_SEND: "friend:request_send",
  FRIEND_REQUEST_RECEIVE: "friend:request_receive",
  FRIEND_REQUEST_ACCEPT: "friend:request_accept",
  FRIEND_REQUEST_REJECT: "friend:request_reject",

  MINIHOME_VISIT: "minihome:visit",
  MINIHOME_VISITED: "minihome:visited",
  GUESTBOOK_ENTRY_ADD: "guestbook:entry_add",
  GUESTBOOK_ENTRY_NEW: "guestbook:entry_new",

  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  MESSAGE_READ: "message:read",
  MESSAGE_DELETE: "message:delete",

  SYNC_REQUEST: "sync:request",
  SYNC_RESPONSE: "sync:response",
} as const;

export default SOCKET_EVENTS;
