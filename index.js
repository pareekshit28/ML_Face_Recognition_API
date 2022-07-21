const canvas = require('canvas')
const faceapi = require('face-api.js')
const express = require('express')
const cors = require("cors")
const fs = require("fs")
const bodyparser = require("body-parser")

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const port = process.env.PORT || 3000;

const app = express();

app.use(cors())
app.use(bodyparser.json({limit: '50mb'}))
app.use(bodyparser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit:50000
  }))

app.post("/getFaceData", async (req,res)=>{
    try {
        fs.writeFileSync("./images/img.jpg", req.body.image, "base64")
        getFaceData(res)
    } catch (error) {
        console.log(error)
        res.status(500).send("error")
    }
})

function getFaceData(res){
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
        faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
        faceapi.nets.ssdMobilenetv1.loadFromDisk('./models'),
    ]).then(async () => {
        console.log("loaded")
        const image = await canvas.loadImage("./images/img.jpg")
        console.log("Image loaded")
        const result = await faceapi
        .detectSingleFace(image)
        .withFaceLandmarks()
        .withFaceDescriptor()
        if(result){
            console.log(result.descriptor)
            res.send(result.descriptor)
        } else {
            console.log("Image Not Clear")
            res.status(500).send("Image Not Clear")
        }
    })
}

app.listen(port)