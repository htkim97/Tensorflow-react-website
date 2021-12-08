// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import QrReader from "react-qr-reader";
import "./App.css";
// 2. TODO - Import drawing utility here
// e.g. import { drawRect } from "./utilities";
import {drawRect} from "./utilites";

function App() {
  //qr
  const [text, setText] = useState('');
  const [scanResultWebCam,setScanResultWebCam]=useState('');

  const handleScanWebCam=(result) =>{
    setScanResultWebCam(result);
  }


  const headleScanWebError = (e) => {
    console.log('터짐')
  }

//detection
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);

  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    // e.g. const net = await cocossd.load();
    //https://khtobjectdetectionmodel.s3.jp-tok.cloud-object-storage.appdomain.cloud/undefinedmodel.json
    const net = await tf.loadGraphModel("https://khtobjectdetectionmodel.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json")
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 16.7);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      

      // 4. TODO - Make Detections
     const img = tf.browser.fromPixels(video)
     const resized=tf.image.resizeBilinear(img,[640,480])
     const casted=resized.cast('int32')
     const expanded=casted.expandDims(0)
     const obj=await net.executeAsync(expanded)
     

     const boxes = await obj[2].array()
     const classes = await obj[6].array()
     const scores =await obj[0].array()




      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
     

      

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)  

      requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.8, videoWidth, videoHeight, ctx)});


      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)
    }
  };

  useEffect(()=>{runCoco()},[]);

  
  return (
    <div className="App">
      <header className="App-header">
        <div className="app-inner"> 
                 <QrReader
            className="i-qr"
            onError={headleScanWebError}
            onScan={handleScanWebCam}
          />
        <Webcam
          ref={webcamRef}
          muted={true} 
          className="i-webcam"
        />

        <canvas
          ref={canvasRef}
          className="i-canvas"
        />


          </div>
         
          <div className="i-result">

            <div>{scanResultWebCam}</div>
          </div>

      </header>
    </div>
  );
}

export default App;
