import React, { useEffect, useRef, useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/webSocket';
import { sendSdpOffer, sendIceCandidate } from '../services/api';

const VideoCall = ({ toUserId, currentUserId }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        const initWebRTC = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        initWebRTC();

        const onCallRequest = async (callRequest) => {
            // 통화 요청 처리 로직 구현
        };

        const onSdpAnswer = async (sdpAnswer) => {
            try {
                await peerConnection.current.setRemoteDescription(
                    new RTCSessionDescription({ type: 'answer', sdp: sdpAnswer.sdp })
                );
            } catch (error) {
                console.error('Error handling SDP answer:', error);
            }
        };

        const onIceCandidate = async (iceCandidate) => {
            try {
                await peerConnection.current.addIceCandidate(
                    new RTCIceCandidate(iceCandidate.candidate)
                );
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
            }
        };

        connectWebSocket(onCallRequest, onSdpAnswer, onIceCandidate);

        return () => {
            disconnectWebSocket();
        };
    }, []);

    const handleAcceptCall = async () => {
        try {
            peerConnection.current = new RTCPeerConnection();

            localStream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, localStream);
            });

            peerConnection.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            const sdpOffer = {
                fromUser: currentUserId, // 동적으로 전달받은 사용자 ID 사용
                toUser: toUserId,
                sdp: offer.sdp,
            };
            const sdpAnswer = await sendSdpOffer(sdpOffer);

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    const iceCandidate = {
                        fromUser: currentUserId, // 동적으로 전달받은 사용자 ID 사용
                        toUser: toUserId,
                        candidate: event.candidate.toJSON(),
                    };
                    sendIceCandidate(iceCandidate);
                }
            };
        } catch (error) {
            console.error('Error handling call request:', error);
        }
    };

    return (
        <div>
            {localStream && (
                <video autoPlay muted ref={(ref) => (ref.srcObject = localStream)} />
            )}
            {remoteStream && (
                <video autoPlay ref={(ref) => (ref.srcObject = remoteStream)} />
            )}
            <button onClick={handleAcceptCall}>Accept Call</button>
        </div>
    );
};

export default VideoCall;