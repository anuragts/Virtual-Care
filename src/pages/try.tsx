import { useEffect, useRef, useState } from "react";
import "firebase/compat/firestore";
import firebase from "firebase/compat/app";
import { useUser } from "@auth0/nextjs-auth0/client";
import { BsClipboard } from "react-icons/bs";
import copy from "copy-to-clipboard";
import Link from "next/link";

const firebaseConfig = {
  apiKey: "AIzaSyAeu1lrM7kbskxHrIr1-9E29EUctAu4QK4",
  authDomain: "virtual-care-b5304.firebaseapp.com",
  projectId: "virtual-care-b5304",
  storageBucket: "virtual-care-b5304.appspot.com",
  messagingSenderId: "620332107461",
  appId: "1:620332107461:web:1734a6dc1aba349cd2d2ac",
  measurementId: "G-ZYE8LJQWCC",
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
  const [roomId, setRoomId] = useState<string>("");
  const [isOfferer, setIsOfferer] = useState<boolean>(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { user, error, isLoading } = useUser();

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
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

    roomRef.onSnapshot(async (snapshot: any) => {
      const data = snapshot.data();
      if (peerConnection.current && data?.answer) {
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await peerConnection.current.setRemoteDescription(
          rtcSessionDescription
        );
      }
    });

    roomRef.collection("candidates").onSnapshot((snapshot: any) => {
      snapshot.docChanges().forEach(async (change: any) => {
        if (change.type === "added") {
          const data = change.doc.data() as RTCIceCandidateType;
          if (peerConnection.current) {
            if (peerConnection.current.currentRemoteDescription) {
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(data)
              );
            } else {
              console.warn(
                "Cannot add ICE candidate. Remote description is not set yet."
              );
            }
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

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };

        peerConnection.current.onicecandidate = async (event) => {
          if (event.candidate) {
            await roomRef
              .collection("candidates")
              .add(event.candidate.toJSON());
          }
        };

        const rtcSessionDescription = new RTCSessionDescription(offer);
        await peerConnection.current.setRemoteDescription(
          rtcSessionDescription
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        await roomRef.update({
          answer: { sdp: answer.sdp, type: answer.type },
        });

        roomRef.collection("candidates").onSnapshot((snapshot: any) => {
          snapshot.docChanges().forEach(async (change: any) => {
            if (change.type === "added") {
              const data = change.doc.data() as RTCIceCandidateType;
              if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(
                  new RTCIceCandidate(data)
                );
              }
            }
          });
        });
      }
    }
  };

  return (
    <>
      <div>
        {!user && (
          <div>
            <div className="grid h-screen place-items-center">
              <Link
                href={"/api/auth/login"}
                className="bg-green-400 border-2 border-green-400 text-[#121212] hover:bg-[#121212] hover:text-green-400   font-bold py-2 px-4 rounded-full shadow-lg focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign In with Auth0
              </Link>
            </div>
          </div>
        )}
        {user && (
          <div>
            <div className="flex justify-center mt-10">
              <div className="mx-10">
                <video
                  autoPlay
                  ref={(video) => video && (video.srcObject = localStream)}
                />
              </div>
              <div className="mx-10">
                <video
                  autoPlay
                  ref={(video) => video && (video.srcObject = remoteStream)}
                />
              </div>
            </div>

            <div className="text-center">
              {roomId ? null : (
                <button
                  className="text-2xl text-[#121212] font-semibold py-3 px-10 rounded-full border-2 border-green-400 hover:bg-[#121212] hover:text-green-400 bg-green-400 mx-5 my-10"
                  onClick={startCall}
                >
                  Start Call
                </button>
              )}{" "}
              <br />
              {roomId ? (
                <div>
                  {" "}
                  <div>Room ID - {roomId} </div>{" "}
                  <div>
                  <button
                type="button"
                value="copy text"
                className=" text-base md:text-xl cursor-pointer z-10 text-secondary mt-8 md:mt-2 rounded px-6 md:px-10 py-2 my-4 hover:bg-secondary hover:text-white border-2 border-secondary"
                onClick={() => {
                  copy(`${roomId || " "}`);
                  alert("Copied to clipboard");
                }}
              >
                <BsClipboard className="inline" />
              </button>
                  </div>
                </div>
              ) : null}
              {remoteStream || localStream ? null : (
                <button
                  className="text-2xl text-[#121212] py-3 px-10 font-semibold rounded-full border-2 border-green-400 hover:bg-[#121212] hover:text-green-400 bg-green-400 mx-5 my-10"
                  onClick={joinCall}
                >
                  Join Call
                </button>
              )}
              {roomId ? null : (
                <div>
                  <div className="my-5 text-xl">Room ID </div>
                  <input
                    className="py-3 px-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    onChange={(e) => {
                      setRoomId(e.target.value);
                      joinCall;
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoCall;
