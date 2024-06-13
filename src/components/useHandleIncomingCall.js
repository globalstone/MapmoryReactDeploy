import React, { useState, useEffect } from 'react';
import { IncomingCallModal } from './IncomingCallModal';
import socketIO from 'socket.io-client';

const useHandleIncomingCall = (callRequest, currentUserId) => {
    const [showModal, setShowModal] = useState(false);
    const [peerConnection, setPeerConnection] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const socket = socketIO('https://your-signaling-server.com');

    useEffect(() => {
        const initPeerConnection = async () => {
            try {
                const pc = new RTCPeerConnection();
                setPeerConnection(pc);

                pc.ontrack = (event) => {
                    event.streams[0].getTracks().forEach((track) => {
                        setRemoteStream((prevStream) => {
                            const newStream = new MediaStream();
                            prevStream?.getTracks().forEach((prevTrack) => {
                                newStream.addTrack(prevTrack);
                            });
                            newStream.addTrack(track);
                            return newStream;
                        });
                    });
                };

                socket.on('offer', async (data) => {
                    if (data.toUser === currentUserId) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('answer', { toUser: data.fromUser, sdp: answer.sdp });
                    }
                });

                socket.on('answer', async (data) => {
                    if (data.toUser === currentUserId) {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    }
                });
            } catch (error) {
                console.error('Error creating RTCPeerConnection:', error);
            }
        };

        initPeerConnection();
    }, [currentUserId, socket]);

    const acceptCall = async (callRequest) => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const sdpOffer = {
                fromUser: currentUserId,
                toUser: callRequest.fromUser,
                sdp: offer.sdp,
            };
            socket.emit('offer', sdpOffer);

            setShowModal(false);
        } catch (error) {
            console.error('Error accepting call:', error);
        }
    };

    const rejectCall = () => {
        setShowModal(false);
    };

    setShowModal(true);

    return (
        <div>
            {showModal && (
                <IncomingCallModal
                    callRequest={callRequest}
                    acceptCall={acceptCall}
                    rejectCall={rejectCall}
                />
            )}
            {remoteStream && <video autoPlay src={URL.createObjectURL(remoteStream)} />}
        </div>
    );
};

export default useHandleIncomingCall;