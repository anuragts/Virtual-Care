import { useEffect, useRef } from "react";

export default function () {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing camera and microphone", error);
        });
    }
  }, [videoRef]);

  return (
    <>
      <video ref={videoRef} width="640" height="480" autoPlay></video>
    </>
  );
}
