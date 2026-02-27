/**
 * Exotel WebRTC Service
 * Manages WebRTC outbound calls using Exotel CRM WebSDK
 * Features:
 * - Auto-initialization on first use
 * - Keeps softphone always registered
 * - Auto-reinitialize on failure
 */

import ExotelCRMWebSDK from '@exotel-npm-dev/exotel-ip-calling-crm-websdk';

// Types
export interface CallConfig {
  phoneNumber: string;
  consultationId?: string;
  customerName?: string;
}

type CallStatus = 'idle' | 'initializing' | 'registering' | 'ready' | 'calling' | 'connected' | 'ended' | 'failed';

type StatusCallback = (status: CallStatus, data?: any) => void;

class ExotelWebRTCService {
  private crmWebSDK: any = null;
  private webPhone: any = null;
  private isInitialized: boolean = false;
  private isRegistered: boolean = false;
  private currentSession: any = null;
  private statusCallbacks: Set<StatusCallback> = new Set();
  private callStartTime: Date | null = null;
  private initializationPromise: Promise<void> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Ensure the service is initialized (singleton pattern)
   * This can be called multiple times safely
   */
  async ensureInitialized(onStatusChange?: StatusCallback): Promise<void> {
    // If already initialized and registered, return immediately
    if (this.isInitialized && this.isRegistered) {
      console.log('[ExotelWebRTC] Already initialized and registered');
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      console.log('[ExotelWebRTC] Initialization in progress, waiting...');
      return this.initializationPromise;
    }

    // Request microphone permission first
    await this.requestMicrophonePermission();

    // Start initialization
    this.initializationPromise = this.initialize(onStatusChange);

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Request microphone permission
   */
  private async requestMicrophonePermission(): Promise<void> {
    try {
      console.log('[ExotelWebRTC] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[ExotelWebRTC] ✅ Microphone permission granted');

      // Stop the temporary stream (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      console.warn('[ExotelWebRTC] Microphone permission denied or not available:', error.message);
      // Don't throw error, let the SDK handle it
    }
  }

  /**
   * Fetch Exotel configuration from backend API
   */
  private async fetchExotelConfig(): Promise<{ appToken: string; userId: string }> {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    // Get admin's phone number from localStorage user object
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const phoneNumber = user?.phone_number?.trim();

    if (!phoneNumber) {
      throw new Error('Phone number not found. Please login again.');
    }

    // Use API_URL from env for exotel-config endpoint
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const exotelConfigUrl = `${apiUrl}/api/v1/admin-users/exotel-config?phone_number=${phoneNumber}`;

    console.log('[ExotelWebRTC] Fetching config from:', exotelConfigUrl);

    const response = await fetch(exotelConfigUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-internal-api-key': 'dummy_service_secret'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      throw new Error(`Failed to fetch Exotel config: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.exotel_app_token || !data.exotel_user_id) {
      throw new Error('Invalid Exotel configuration received from server');
    }

    // Use exotel_user_id returned from backend
    return {
      appToken: data.exotel_app_token,
      userId: data.exotel_user_id
    };
  }

  /**
   * Initialize the Exotel WebRTC SDK
   */
  private async initialize(onStatusChange?: StatusCallback): Promise<void> {
    try {
      if (onStatusChange) {
        this.statusCallbacks.add(onStatusChange);
      }
      this.notifyStatus('initializing');

      // Check if config is already cached in localStorage
      const exotelConfigStr = localStorage.getItem('exotel_config');
      let appToken: string;
      let userId: string;

      if (exotelConfigStr) {
        try {
          const exotelConfig = JSON.parse(exotelConfigStr);
          appToken = exotelConfig.appToken;
          userId = exotelConfig.userId;
          console.log('[ExotelWebRTC] Using cached credentials from localStorage');
        } catch (e) {
          console.warn('[ExotelWebRTC] Failed to parse cached config, fetching from API');
          const config = await this.fetchExotelConfig();
          appToken = config.appToken;
          userId = config.userId;
          // Cache the config
          localStorage.setItem('exotel_config', JSON.stringify(config));
        }
      } else {
        console.log('[ExotelWebRTC] Fetching credentials from backend API...');
        const config = await this.fetchExotelConfig();
        appToken = config.appToken;
        userId = config.userId;
        // Cache the config
        localStorage.setItem('exotel_config', JSON.stringify(config));
      }

      console.log('[ExotelWebRTC] Initializing with user ID:', userId);

      // Create SDK instance with autoConnectVOIP = false (manual registration)
      this.crmWebSDK = new ExotelCRMWebSDK(appToken, userId, false);

      // Initialize the SDK
      this.webPhone = await this.crmWebSDK.Initialize(
        this.handleCallEvents.bind(this),
        this.handleRegistrationEvents.bind(this),
        this.handleSessionEvents.bind(this)
      );

      if (!this.webPhone) {
        throw new Error('Failed to initialize WebPhone');
      }

      this.isInitialized = true;
      this.reconnectAttempts = 0;
      console.log('[ExotelWebRTC] SDK initialized successfully');

      // Auto-register the device
      await this.registerDevice();

    } catch (error: any) {
      console.error('[ExotelWebRTC] Initialization failed:', error);
      this.notifyStatus('failed', { error: error.message });

      // Auto-reinitialize on failure
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`[ExotelWebRTC] Re-initialization attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

        // Clear old state
        this.isInitialized = false;
        this.isRegistered = false;
        this.webPhone = null;
        this.crmWebSDK = null;

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Retry
        return this.initialize(onStatusChange);
      } else {
        // Max retries reached
        this.reconnectAttempts = 0;
        throw new Error(`Initialization failed after ${this.maxReconnectAttempts} attempts: ${error.message}`);
      }
    }
  }

  /**
   * Register the SIP device
   */
  private async registerDevice(): Promise<void> {
    if (!this.webPhone) {
      throw new Error('WebPhone not initialized');
    }

    try {
      this.notifyStatus('registering');
      console.log('[ExotelWebRTC] Registering SIP device...');

      await this.webPhone.RegisterDevice();
      // Status will be updated via handleRegistrationEvents callback

    } catch (error) {
      console.error('[ExotelWebRTC] Device registration failed:', error);
      this.notifyStatus('failed', { error: 'Registration failed' });
      throw error;
    }
  }

  /**
   * Make an outbound call
   * Auto-initializes if needed
   */
  async makeCall(config: CallConfig, onStatusChange?: StatusCallback): Promise<void> {
    try {
      // Check if there's an active call
      if (this.callStartTime) {
        throw new Error('There is an active call. Please end the current call before making a new one.');
      }

      // Ensure service is initialized and registered
      await this.ensureInitialized(onStatusChange);

      // Double-check registration status
      if (!this.isRegistered) {
        throw new Error('Phone not ready. Still registering...');
      }

      // Clean and format phone number
      let cleanedNumber = config.phoneNumber.trim();

      // Remove all spaces, dashes, parentheses, etc.
      cleanedNumber = cleanedNumber.replace(/[\s\-\(\)]/g, '');

      // Remove leading + if present
      if (cleanedNumber.startsWith('+')) {
        cleanedNumber = cleanedNumber.substring(1);
      }

      // Ensure it starts with 91 (country code without +)
      if (!cleanedNumber.startsWith('91')) {
        // If it starts with 0, replace with country code
        if (cleanedNumber.startsWith('0')) {
          cleanedNumber = '91' + cleanedNumber.substring(1);
        } else {
          // Add country code if not present
          cleanedNumber = '91' + cleanedNumber;
        }
      }

      console.log('[ExotelWebRTC] Original number:', config.phoneNumber);
      console.log('[ExotelWebRTC] Cleaned number:', cleanedNumber);
      console.log('[ExotelWebRTC] webPhone object:', this.webPhone);
      console.log('[ExotelWebRTC] webPhone.MakeCall type:', typeof this.webPhone.MakeCall);
      this.notifyStatus('calling', { phoneNumber: cleanedNumber });

      // Make the call
      const callResult = await this.webPhone.MakeCall(cleanedNumber, (result: any) => {
        console.log('[ExotelWebRTC] Dial callback result:', result);
      });

      console.log('[ExotelWebRTC] MakeCall returned:', callResult);
      console.log('[ExotelWebRTC] Current session after MakeCall:', this.currentSession);

    } catch (error: any) {
      console.error('[ExotelWebRTC] Make call failed:', error);

      // If error is related to registration, try to reinitialize
      if (error.message.includes('not ready') || error.message.includes('registering')) {
        console.log('[ExotelWebRTC] Registration lost, re-initializing...');
        this.isRegistered = false;
        this.isInitialized = false;
        await this.ensureInitialized(onStatusChange);
        // Retry the call
        return this.makeCall(config, onStatusChange);
      }

      this.notifyStatus('failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Hangup the current call
   */
  async hangupCall(): Promise<void> {
    if (!this.webPhone) return;

    try {
      console.log('[ExotelWebRTC] Hanging up...');
      await this.webPhone.HangupCall();
      this.currentSession = null;
      this.callStartTime = null;
      this.notifyStatus('ended');

    } catch (error) {
      console.error('[ExotelWebRTC] Hangup failed:', error);
    }
  }

  /**
   * Toggle mute
   */
  async toggleMute(): Promise<void> {
    if (!this.webPhone) return;

    try {
      await this.webPhone.ToggleMute();
      console.log('[ExotelWebRTC] Mute toggled');
    } catch (error) {
      console.error('[ExotelWebRTC] Toggle mute failed:', error);
    }
  }

  /**
   * Get call duration in seconds
   */
  getCallDuration(): number {
    if (!this.callStartTime) return 0;
    return Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
  }

  /**
   * Handle call events
   */
  private handleCallEvents(event: any): void {
    console.log('[ExotelWebRTC] Call event:', event);

    let eventType = null;

    if (typeof event === 'string') {
      eventType = event;
    } else if (Array.isArray(event)) {
      eventType = event[0];
    } else if (event) {
      eventType = event.type || event.eventType;
    }

    // Auto-answer incoming calls (this is the callback from our outbound call)
    if (eventType === 'incoming' || eventType === 'i_new_call') {
      console.log('[ExotelWebRTC] 📞 Incoming call detected! Auto-answering...');
      this.notifyStatus('calling', { message: 'Connecting...' });

      // Automatically accept the call after a short delay
      setTimeout(async () => {
        try {
          console.log('[ExotelWebRTC] ✅ Accepting call automatically...');
          await this.webPhone.AcceptCall();
          console.log('[ExotelWebRTC] ✅ Call accepted!');

          // Attach audio after accepting
          if (this.currentSession) {
            this.attachAudioToSession(this.currentSession);
          }

        } catch (err: any) {
          console.error('[ExotelWebRTC] Auto-answer failed:', err);
          this.notifyStatus('failed', { error: err.message });
        }
      }, 500);
    }
  }

  /**
   * Handle registration events
   */
  private handleRegistrationEvents(event: any): void {
    console.log('[ExotelWebRTC] Registration event:', event);

    let registered = false;

    if (typeof event === 'string') {
      registered = event === 'registered' || event === 'connected';
    } else if (Array.isArray(event)) {
      registered = event[0] === 'registered' || event[0] === 'connected';
    } else {
      registered = event.registered || event.connected;
    }

    this.isRegistered = registered;

    if (registered) {
      console.log('[ExotelWebRTC] ✅ SIP Device Registered');
      this.notifyStatus('ready');
    } else {
      // If unregistered, try to re-register
      console.log('[ExotelWebRTC] SIP Device unregistered, attempting to re-register...');
      this.tryReRegister();
    }
  }

  /**
   * Try to re-register the device
   */
  private async tryReRegister(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      if (this.webPhone && this.isInitialized && !this.isRegistered) {
        try {
          console.log('[ExotelWebRTC] Attempting to re-register...');
          await this.webPhone.RegisterDevice();
        } catch (error) {
          console.error('[ExotelWebRTC] Re-registration failed:', error);
          // If re-registration fails, try full re-initialization
          this.isInitialized = false;
          this.isRegistered = false;
          await this.ensureInitialized();
        }
      }
    }, 3000);
  }

  /**
   * Handle session events
   */
  private handleSessionEvents(event: any): void {
    console.log('[ExotelWebRTC] Session event:', event);

    let state = null;
    let session = null;

    if (typeof event === 'string') {
      state = event;
    } else if (Array.isArray(event)) {
      state = event[0];
      session = event[1]?.session || event[1]?.session || null;
    } else if (event) {
      state = event.state;
      session = event.session || null;
    }

    // Store the session for audio attachment
    if (session) {
      this.currentSession = session;
      console.log('[ExotelWebRTC] Session stored for audio attachment');

      // Attach audio when session is available and has media handler
      if (session.mediaHandler && session.mediaHandler.remoteMediaStream) {
        this.attachAudio(session.mediaHandler.remoteMediaStream);
      } else if (session.mediaHandler) {
        // Wait for remote media stream to be ready
        console.log('[ExotelWebRTC] Waiting for remote media stream...');
      }
    }

    // Track call timing
    if (state === 'connected' && !this.callStartTime) {
      this.callStartTime = new Date();
      this.notifyStatus('connected');

      // Try to attach audio when connected
      if (this.currentSession) {
        this.attachAudioToSession(this.currentSession);
      }
    }

    if (state === 'ended' || state === 'failed') {
      // Cleanup call state to allow next call
      console.log('[ExotelWebRTC] Call ended, cleaning up session...');
      this.callStartTime = null;
      this.currentSession = null;
      this.notifyStatus(state === 'ended' ? 'ended' : 'failed');

      // Clear the audio element
      setTimeout(() => {
        const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.srcObject = null;
        }
      }, 500);
    }

    if (state === 'ringing') {
      this.notifyStatus('calling');
    }
  }

  /**
   * Attach audio stream to audio element
   */
  private attachAudio(mediaStream: any): void {
    try {
      const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
      if (audioElement && mediaStream) {
        // Check if the media stream has an attachAudioElement method
        if (typeof mediaStream.attachAudioElement === 'function') {
          mediaStream.attachAudioElement(audioElement);
          console.log('[ExotelWebRTC] Audio attached via attachAudioElement');
        } else if (mediaStream.getMediaStream && audioElement.srcObject !== mediaStream.getMediaStream()) {
          // Use WebRTC MediaStream API
          audioElement.srcObject = mediaStream.getMediaStream();
          audioElement.play().catch(e => console.error('[ExotelWebRTC] Audio play error:', e));
          console.log('[ExotelWebRTC] Audio attached via srcObject');
        }
      }
    } catch (error) {
      console.error('[ExotelWebRTC] Failed to attach audio:', error);
    }
  }

  /**
   * Attach audio from session
   */
  private attachAudioToSession(session: any): void {
    try {
      const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
      if (!audioElement) {
        console.warn('[ExotelWebRTC] Audio element not found');
        return;
      }

      // Try different ways to attach audio based on SDK structure
      if (session.mediaHandler && session.mediaHandler.remoteMediaStream) {
        const remoteStream = session.mediaHandler.remoteMediaStream;

        // Method 1: attachAudioElement (SIP.js style)
        if (typeof remoteStream.attachAudioElement === 'function') {
          remoteStream.attachAudioElement(audioElement);
          console.log('[ExotelWebRTC] ✅ Audio attached (method 1)');
          return;
        }

        // Method 2: getMediaStream() with srcObject
        if (typeof remoteStream.getMediaStream === 'function') {
          const stream = remoteStream.getMediaStream();
          if (stream && audioElement.srcObject !== stream) {
            audioElement.srcObject = stream;
            audioElement.play().catch(e => console.error('[ExotelWebRTC] Play error:', e));
            console.log('[ExotelWebRTC] ✅ Audio attached (method 2)');
            return;
          }
        }

        // Method 3: Direct stream object
        if (remoteStream instanceof MediaStream) {
          audioElement.srcObject = remoteStream;
          audioElement.play().catch(e => console.error('[ExotelWebRTC] Play error:', e));
          console.log('[ExotelWebRTC] ✅ Audio attached (method 3)');
          return;
        }
      }

      console.warn('[ExotelWebRTC] Could not attach audio - no compatible method found');
    } catch (error) {
      console.error('[ExotelWebRTC] Error attaching audio:', error);
    }
  }

  /**
   * Register status callback
   */
  onStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  /**
   * Notify status change to all callbacks
   */
  private notifyStatus(status: CallStatus, data?: any): void {
    this.statusCallbacks.forEach(callback => callback(status, data));
  }

  /**
   * Get current status
   */
  getStatus(): {
    isInitialized: boolean;
    isRegistered: boolean;
    isInCall: boolean;
    canMakeCall: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isRegistered: this.isRegistered,
      isInCall: this.callStartTime !== null,
      canMakeCall: this.isInitialized && this.isRegistered && this.callStartTime === null
    };
  }

  /**
   * Reset call state (call this after a call ends to allow new calls)
   */
  resetCallState(): void {
    console.log('[ExotelWebRTC] Resetting call state...');
    this.callStartTime = null;
    this.currentSession = null;

    // Clear the audio element
    const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.srcObject = null;
    }
  }

  /**
   * Cleanup (optional, only needed when closing the app)
   */
  async cleanup(): Promise<void> {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (this.isRegistered && this.webPhone) {
        await this.webPhone.UnRegisterDevice();
      }
      this.crmWebSDK = null;
      this.webPhone = null;
      this.isInitialized = false;
      this.isRegistered = false;
      this.currentSession = null;
      this.callStartTime = null;
      this.statusCallbacks.clear();
      console.log('[ExotelWebRTC] Cleaned up');
    } catch (error) {
      console.error('[ExotelWebRTC] Cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const exotelWebRTCService = new ExotelWebRTCService();
