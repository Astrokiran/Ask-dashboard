import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, LinearProgress } from '@mui/material';
import { Phone, PhoneDisabled, Mic, MicOff } from '@mui/icons-material';
import { exotelWebRTCService, CallConfig } from '../services/exotelWebRTC';

interface WebRTCCallButtonProps {
  phoneNumber: string;
  customerName?: string;
  consultationId?: string;
  label?: string;
  onCallStart?: () => void;
  onCallEnd?: (duration: number) => void;
}

export const WebRTCCallButton: React.FC<WebRTCCallButtonProps> = ({
  phoneNumber,
  customerName,
  consultationId,
  label = 'Call',
  onCallStart,
  onCallEnd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'initializing' | 'registering' | 'ready' | 'calling' | 'connected' | 'ended' | 'failed'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusCallbackRef = useRef<((status: any, data?: any) => void) | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Initialize WebRTC when dialog opens
  useEffect(() => {
    if (isOpen && status === 'idle') {
      initializeWebRTC();
    }

    // Cleanup status callback when dialog closes
    return () => {
      if (statusCallbackRef.current) {
        statusCallbackRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeWebRTC = async () => {
    try {
      setError(null);

      // Create status callback for this session
      statusCallbackRef.current = (newStatus: any, data?: any) => {
        setStatus(newStatus);
        if (newStatus === 'connected') {
          startCallTimer();
          onCallStart?.();
        }
        if (newStatus === 'ended') {
          stopCallTimer();
          const duration = exotelWebRTCService.getCallDuration();
          onCallEnd?.(duration);
          // Reset call state to allow new calls
          exotelWebRTCService.resetCallState();
          // Close dialog after a short delay
          setTimeout(() => {
            setIsOpen(false);
            // Reset status after closing for next call
            setTimeout(() => {
              setStatus('idle');
              setError(null);
              setCallDuration(0);
            }, 500);
          }, 1500);
        }
        if (newStatus === 'failed') {
          setError(data?.error || 'Call failed');
          // Reset call state on failure too
          exotelWebRTCService.resetCallState();
        }
      };

      // Ensure initialization (will auto-register and keep registered)
      await exotelWebRTCService.ensureInitialized(statusCallbackRef.current);

    } catch (err: any) {
      setError(err.message || 'Failed to initialize phone');
      setStatus('failed');
    }
  };

  const startCallTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    const interval = setInterval(() => {
      setCallDuration(exotelWebRTCService.getCallDuration());
    }, 1000);
    timerIntervalRef.current = interval;
  };

  const stopCallTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setCallDuration(0);
  };

  const handleMakeCall = async () => {
    try {
      setError(null);
      const config: CallConfig = {
        phoneNumber,
        customerName,
        consultationId,
      };
      await exotelWebRTCService.makeCall(config, statusCallbackRef.current || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to make call');
    }
  };

  const handleHangup = async () => {
    try {
      await exotelWebRTCService.hangupCall();
      stopCallTimer();
    } catch (err: any) {
      console.error('Hangup error:', err);
    }
  };

  const handleToggleMute = async () => {
    try {
      await exotelWebRTCService.toggleMute();
      setIsMuted(!isMuted);
    } catch (err) {
      console.error('Toggle mute error:', err);
    }
  };

  const handleClose = () => {
    if (status === 'connected' || status === 'calling') {
      // Don't allow closing while in call
      return;
    }
    setIsOpen(false);
    setStatus('idle');
    setError(null);
    setCallDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'initializing': return 'Initializing phone...';
      case 'registering': return 'Registering...';
      case 'ready': return 'Ready to call';
      case 'calling': return 'Calling...';
      case 'connected': return 'Connected';
      case 'ended': return 'Call ended';
      case 'failed': return 'Call failed';
      default: return '';
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'connected': return '#4caf50';
      case 'calling': return '#ff9800';
      case 'failed': return '#f44336';
      case 'ended': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Phone />}
        onClick={() => setIsOpen(true)}
        size="small"
      >
        {label}
      </Button>

      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              📞 WebRTC Call
            </Typography>
            {status !== 'idle' && (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(),
                    animation: status === 'calling' ? 'pulse 1s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {getStatusText()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Customer
            </Typography>
            <Typography variant="h6">
              {customerName || 'Unknown'}
            </Typography>
            <Typography variant="body1" color="primary">
              {phoneNumber}
            </Typography>
            {consultationId && (
              <Typography variant="caption" color="textSecondary">
                Consultation ID: {consultationId}
              </Typography>
            )}
          </Box>

          {error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2" color="error.dark">
                {error}
              </Typography>
            </Box>
          )}

          {status === 'initializing' || status === 'registering' ? (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                {getStatusText()}
              </Typography>
            </Box>
          ) : null}

          {status === 'connected' && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: getStatusColor() }}>
                {formatDuration(callDuration)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Call duration
              </Typography>
            </Box>
          )}

          {status === 'ready' && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="success.dark">
                ✓ Phone ready. You can make calls now.
              </Typography>
            </Box>
          )}

          {status === 'ended' && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.dark">
                Call duration: {formatDuration(callDuration)}
              </Typography>
            </Box>
          )}

          {/* Audio element for WebRTC */}
          <audio
            id="remoteAudio"
            autoPlay
            playsInline
            style={{ display: 'none' }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1 }}>
          {status === 'ready' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Phone />}
              onClick={handleMakeCall}
              size="large"
            >
              Call Now
            </Button>
          )}

          {(status === 'connected' || status === 'calling') && (
            <>
              <IconButton
                onClick={handleToggleMute}
                color={isMuted ? 'error' : 'default'}
                size="large"
                sx={{ border: 1, borderColor: 'divider' }}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </IconButton>

              <Button
                variant="contained"
                color="error"
                startIcon={<PhoneDisabled />}
                onClick={handleHangup}
                size="large"
              >
                Hang Up
              </Button>
            </>
          )}

          {status === 'ended' || status === 'failed' ? (
            <Button
              variant="outlined"
              onClick={handleClose}
            >
              Close
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
};
