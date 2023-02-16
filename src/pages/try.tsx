    import { useEffect, useRef, useState } from "react";
    import 'firebase/compat/firestore';
    import firebase from 'firebase/compat/app';


    const firebaseConfig = {
        apiKey: "AIzaSyAeu1lrM7kbskxHrIr1-9E29EUctAu4QK4",
        authDomain: "virtual-care-b5304.firebaseapp.com",
        projectId: "virtual-care-b5304",
        storageBucket: "virtual-care-b5304.appspot.com",
        messagingSenderId: "620332107461",
        appId: "1:620332107461:web:1734a6dc1aba349cd2d2ac",
        measurementId: "G-ZYE8LJQWCC"
    };

    if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    }

    const firestore = firebase.firestore();

    type RTCIceCandidateType = {
    candidate: string;
    sdpMLineIndex: number;
    sdpMid: string;
    };

    type RTCSessionDescriptionType = {
    sdp: string;
    type: "offer" | "answer";
    };

    const VideoCall = () => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [roomId, setRoomId] = useState("");
    const [isOfferer, setIsOfferer] = useState(false);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    const startCall = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        const roomRef = firestore.collection("rooms").doc();
        setRoomId(roomRef.id);
        peerConnection.current = new RTCPeerConnection();

        stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        };

        peerConnection.current.onicecandidate = async (event) => {
        if (event.candidate) {
            await roomRef.collection("candidates").add(event.candidate.toJSON());
        }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        await roomRef.set({ offer: { sdp: offer.sdp, type: offer.type } });

        setIsOfferer(true);

        roomRef.onSnapshot(async (snapshot :any) => {
        const data = snapshot.data();
        if (peerConnection.current && data?.answer) {
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await peerConnection.current.setRemoteDescription(rtcSessionDescription);
        }
        });

        roomRef.collection("candidates").onSnapshot((snapshot:any) => {
        snapshot.docChanges().forEach(async (change :any) => {
            if (change.type === "added") {
            const data = change.doc.data() as RTCIceCandidateType;
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
            }
            }
        });
        });
    };

    const joinCall = async () => {
        const roomRef = firestore.collection("rooms").doc(roomId);
        const roomSnapshot = await roomRef.get();
        if (roomSnapshot.exists) {
        const offer = roomSnapshot.data()?.offer;
        if (offer) {
            peerConnection.current = new RTCPeerConnection();

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            stream.getTracks().forEach((track) => {
            peerConnection.current?.addTrack(track, stream);
            });

            peerConnection.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            };

            peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate) {
                await roomRef.collection("candidates").add(event.candidate.toJSON());
            }
            };

            const rtcSessionDescription = new RTCSessionDescription(offer);
            await peerConnection.current.setRemoteDescription(rtcSessionDescription);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            await roomRef.update({ answer: { sdp: answer.sdp, type: answer.type } });

            roomRef.collection("candidates").onSnapshot((snapshot:any) => {
            snapshot.docChanges().forEach(async (change :any) => {
                if (change.type === "added") {
                const data = change.doc.data() as RTCIceCandidateType;
                if (peerConnection.current) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data));
                }
                }
            });
            });
        }
        };
    };
    
    return (
        <div>
        <div>
            <video autoPlay ref={(video) => video && (video.srcObject = localStream)} />
        </div>
        <div>
            <video autoPlay ref={(video) => video && (video.srcObject = remoteStream)} />
        </div>
        <div>
            <button onClick={startCall}>Start Call</button>
            <input value={roomId} onChange={(e) => setRoomId(e.target.value)} />
            <button onClick={joinCall}>Join Call</button>
        </div>
        </div>
    );
    };

    export default VideoCall;