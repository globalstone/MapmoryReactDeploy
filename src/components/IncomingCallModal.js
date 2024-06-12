import React from 'react';

export const IncomingCallModal = ({ callRequest, acceptCall, rejectCall }) => {
    return (
        <div>
            <p>{`${callRequest.fromUser}로부터 incoming call이 있습니다.`}</p>
            <button onClick={() => acceptCall(callRequest)}>수락</button>
            <button onClick={rejectCall}>거절</button>
        </div>
    );
};