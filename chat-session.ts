/**
 * Chat Session Data is stored here.
 */

var store: IChatSession = {
  users: new Array(),
  count: 0,
  channels: {
    '#anouncements': {
      type: 'user',
      messages: new Array()
    },
    '#soccer': {
      type: 'user',
      messages: new Array()
    },
    '#jazz': {
      type: 'user',
      messages: new Array()
    },
  }
};

export default store;

/**
 * Interfaces
 */

interface IUser {
  uuid: string,
  tabs: number,
  tab: string,
  nick: string,
  socket: any,
  type: string,
  currentChat: string,
  quit: boolean
};

interface IChatSession {
  users: IUser[],
  count: number,
  channels: { [channel: string]: IChannel }
}

interface IChannel {
  type: string,
  messages: string[];
}
