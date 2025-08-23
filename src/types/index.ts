export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  participants: User[];
  createdAt: Date;
}

export interface VideoStream {
  id: string;
  user: User;
  stream: MediaStream;
  isScreenShare?: boolean;
}

export interface SignalingMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
}
