/**
 * Chat Session Data is stored here.
 */



var store: IChatSession = {
  users: new Array(),
  count: 0,
  channels: {
    '#announcements': {
      type: 'mod',
      messages: new Array()
    },
    '#soccer': {
      type: 'mod',
      messages: new Array()
    },
    '#jazz': {
      type: 'mod',
      messages: new Array()
    },
    '#admin': {
      type: 'sysop',
      messages: new Array()
    },
  }
};

export default store;

/**
 * Interfaces
 */

export interface IUser {
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

export interface IChannel {
  type: string,
  messages: string[];
}
