export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onStreamReceived?: (stream: MediaStream, userId: string) => void;

  constructor(onStreamReceived?: (stream: MediaStream, userId: string) => void) {
    this.onStreamReceived = onStreamReceived;
  }

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection(userId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    peerConnection.ontrack = (event) => {
      if (this.onStreamReceived) {
        this.onStreamReceived(event.streams[0], userId);
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.createPeerConnection(userId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.createPeerConnection(userId);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  addIceCandidate(userId: string, candidate: RTCIceCandidateInit): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.addIceCandidate(candidate);
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  stopScreenShare(): void {
    // Implementation for stopping screen share
  }

  cleanup(): void {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnections.forEach(connection => connection.close());
    this.peerConnections.clear();
  }
}
