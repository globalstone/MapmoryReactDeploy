import React, { useState, useEffect } from 'react';
import { IncomingCallModal } from './IncomingCallModal';

const useHandleIncomingCall = (callRequest, currentUserId) => {
    const [showModal, setShowModal] = useState(false);
    const [peerConnection, setPeerConnection] = useState(null);

    useEffect(() => {
        const initPeerConnection = async () => {
            try {
                const pc = new RTCPeerConnection();
                setPeerConnection(pc);
            } catch (error) {
                console.error('Error creating RTCPeerConnection:', error);
            }
        };

        initPeerConnection();
    }, []);

    const acceptCall = async (callRequest) => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.ontrack = (event) => {
                // 원격 스트림 처리 로직 추가
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const sdpOffer = {
                fromUser: currentUserId,
                toUser: callRequest.fromUser,
                sdp: offer.sdp,
            };
            // SDP 오퍼 전송 로직 추가

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
        </div>
    );
};

export default useHandleIncomingCall;