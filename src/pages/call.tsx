import Video from "./components/Video";

export default () => {
  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  //   Global State
  const pc = new RTCPeerConnection(servers);
  let localStream = null;
  let remoteStream = null;

  const webcamButton = document.getElementById("webcamButton");

 


  return (
    <>
      <div>
        <h1 className="text-center my-10 text-2xl">Call</h1>
        <div className="flex justify-center">
          <div className="mx-10">
            <Video />
          </div>
          <div className="mx-10">
            <Video />
          </div>
        </div>
      </div>
    </>
  );
};
