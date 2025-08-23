import { SignalingMessage } from '../types';

// Mock WebSocket for demo purposes
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  send(data: string) {
    console.log('Mock WebSocket send:', data);
    // Simulate receiving a message back
    setTimeout(() => {
      const message = JSON.parse(data);
      if (message.type === 'join') {
        this.triggerEvent('message', {
          data: JSON.stringify({
            type: 'user-joined',
            user: { id: 'mock-user', name: 'Mock User' }
          })
        });
      }
    }, 100);
  }

  private triggerEvent(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  close() {
    // Mock close
  }
}

export class SignalingClient {
  private ws: WebSocket | MockWebSocket;
  private onMessage?: (message: SignalingMessage) => void;
  private onUserJoined?: (user: any) => void;
  private onUserLeft?: (user: any) => void;

  constructor() {
    // Use mock WebSocket for demo
    this.ws = new MockWebSocket();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.ws.addEventListener('message', (event: any) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'user-joined' && this.onUserJoined) {
          this.onUserJoined(message.user);
        } else if (message.type === 'user-left' && this.onUserLeft) {
          this.onUserLeft(message.user);
        } else if (this.onMessage) {
          this.onMessage(message);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  connect(roomId: string, userId: string) {
    console.log(`Connecting to room ${roomId} as ${userId}`);
    // Mock connection
  }

  send(message: SignalingMessage) {
    this.ws.send(JSON.stringify(message));
  }

  setMessageHandler(callback: (message: SignalingMessage) => void) {
    this.onMessage = callback;
  }

  setUserJoinedHandler(callback: (user: any) => void) {
    this.onUserJoined = callback;
  }

  setUserLeftHandler(callback: (user: any) => void) {
    this.onUserLeft = callback;
  }

  disconnect() {
    this.ws.close();
  }
}
