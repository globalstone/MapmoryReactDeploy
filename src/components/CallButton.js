import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'webstomp-client';

const CallButton = ({ toUserId }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const stompClient = useRef(null);

    useEffect(() => {
        initWebRTC();
        initWebSocket();
    }, []);

    const initWebRTC = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
        } catch (error) {
          console.error('Error accessing media devices:', error);
        }
    };

    const initWebSocket = () => {
        const socket = new SockJS('/ws');
        stompClient.current = Stomp.over(socket);
      
        stompClient.current.connect({}, () => {
            stompClient.current.subscribe(`/user/queue/call`, (response) => {
                const callRequest = JSON.parse(response.body);
                handleCallRequestReceived(callRequest);
            });

            stompClient.current.subscribe(`/user/queue/answer`, (response) => {
                const sdpAnswer = JSON.parse(response.body);
                handleSdpAnswer(sdpAnswer);
            });

            stompClient.current.subscribe(`/user/queue/candidate`, (response) => {
                const iceCandidate = JSON.parse(response.body);
                handleIceCandidate(iceCandidate);
            });
        }, (error) => {
            console.error('Error connecting to WebSocket:', error);
          });
    };

    const handleCallRequest = async () => {
        try {
            await axios.post(`/call?toUserId=${toUserId}`);
        } catch (error) {
            console.error('Error making call request:', error);
        }
    };

    const handleCallRequestReceived = async (callRequest) => {
        try {
          const peerConnection = new RTCPeerConnection();
            setPeerConnection(peerConnection);

            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const sdpOffer = {
                fromUser: callRequest.fromUser,
                toUser: callRequest.toUser,
                sdp: offer.sdp,
            };
            const { data: sdpAnswer } = await axios.post('/call/offer', sdpOffer);
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: sdpAnswer.sdp })
            );

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    const iceCandidate = {
                        fromUser: callRequest.fromUser,
                        toUser: callRequest.toUser,
                        candidate: event.candidate.toJSON(),
                    };
                    axios.post('/call/candidate', iceCandidate);
                }
            };
        } catch (error) {
            console.error('Error handling call request:', error);
          }
        };

    const handleIceCandidate = async (iceCandidate) => {
        try {
            await peerConnection.addIceCandidate(
                new RTCIceCandidate(iceCandidate.candidate)
            );
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const handleSdpAnswer = async (sdpAnswer) => {
        try {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: sdpAnswer.sdp })
            );
        } catch (error) {
            console.error('Error handling SDP answer:', error);
        }
    };

    return (
        <div>
            <button onClick={handleCallRequest}>Call</button>
            {localStream && (
                <video autoPlay muted ref={(ref) => {
                    if (ref) {
                        ref.srcObject = localStream;
                    }
                }} />
            )}
            {remoteStream && (
                <video autoPlay ref={(ref) => {
                    if (ref) {
                        ref.srcObject = remoteStream;
                    }
                }} />
            )}
        </div>
    );
};

export default CallButton;