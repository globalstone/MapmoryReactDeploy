import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'webstomp-client';
import useHandleIncomingCall from '../components/useHandleIncomingCall'; // 경로 수정

let stompClient = null;

export const connectWebSocket = (onCallRequest, onSdpAnswer, onIceCandidate) => {
    const socket = new SockJS('https://mapmory.co.kr/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        stompClient.subscribe(`/user/queue/incoming-call`, (response) => {
            const callRequest = JSON.parse(response.body);
            useHandleIncomingCall(callRequest, 'currentUserId'); // 임시 사용자 ID 사용
        });

        stompClient.subscribe(`/user/queue/answer`, (response) => {
            const sdpAnswer = JSON.parse(response.body);
            onSdpAnswer(sdpAnswer);
        });

        stompClient.subscribe(`/user/queue/candidate`, (response) => {
            const iceCandidate = JSON.parse(response.body);
            onIceCandidate(iceCandidate);
        });
    });
};

export const disconnectWebSocket = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
};