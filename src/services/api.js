import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mapmory.co.kr',
});

export const requestCall = async (toUserId) => {
  try {
    const response = await api.post(`/call?toUserId=${toUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error making call request:', error);
    throw error;
  }
};

export const sendSdpOffer = async (sdpOffer) => {
  try {
    const response = await axios.post('https://mapmory.co.kr/call/offer', sdpOffer);
    return response.data;
  } catch (error) {
    console.error('Error sending SDP offer:', error);
    throw error;
  }
};

export const sendIceCandidate = async (iceCandidate) => {
  try {
    await axios.post('https://mapmory.co.kr/call/candidate', iceCandidate);
  } catch (error) {
    console.error('Error sending ICE candidate:', error);
    throw error;
  }
};