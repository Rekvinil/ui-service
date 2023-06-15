/* eslint-disable */
import React, { useEffect, useState } from 'react'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import Delta from 'quill-delta'
import 'quill/dist/quill.snow.css'
import logo from './doc.svg'
import './App.css'

const host = process.env.REACT_APP_CEE_WEBSOCKET_HOST || 'ws://127.0.0.1:6789/'
let quill;
let websocket;
let isFileChoosen;
let fileName;

function CodeEditor (props) {

    useEffect(() => {
        if(quill !== undefined){
            fileName = props.fileName
            quill.setText(props.content)
            console.log("content")
            isFileChoosen = true
            console.log("RenamedFileName")
            console.log(fileName)
        }
    }, [props.fileName])

    useEffect(()=>{
        let posS = {index: 0, length: 0}
        let oldS = ""
        let writingS = false
        let deltaS = false
        
        
        Quill.register('modules/cursors', QuillCursors)
        quill = new Quill('#editor', {
            theme: 'bubble',
            modules: {
                syntax: true,
                cursors: {
                    hideDelayMs: 5000,
                    hideSpeedMs: 0,
                    selectionChangeSource: null,
                    transformOnTextChange: true,
                },
            }
        })


        quill.setContents(props.content, 'silent')
        const cursors = quill.getModule('cursors')
        oldS = quill.getContents()
        websocket = new WebSocket(host)
        let myCallback = (pos, args) => {
            if (oldS != quill.getContents()) {
                console.log("callback")
                oldS = quill.getContents()
                if(isFileChoosen){
                    console.log("send")
                    console.log(fileName)
                    websocket.send(JSON.stringify({'action': 'write', 'delta': args[0], 'real': args[1], 'content': quill.getContents(), 'position': pos, 'fileName': fileName }))
                }
            }
        }
        let tempPos = {...posS}
        quill.on('editor-change',  (eventName, ...args) => {
            if (eventName === 'text-change') {
                if (!writingS && !deltaS) {
                    console.log("text-change")
                    myCallback(tempPos, args)
                }
            } else if (eventName === 'selection-change') {
                if (!writingS && args[0] || deltaS) {
                    console.log("selection change")
                    tempPos = {...posS}
                    posS = args[0]
                    if(isFileChoosen){
                        console.log(fileName)
                        websocket.send(JSON.stringify({'action': 'move', 'position': posS, 'fileName': fileName}))
                    }
                }
            }
          })
        websocket.onmessage = (e) => {
            if(isFileChoosen){
                console.log("data recieved")
                let data = JSON.parse(e.data)
                console.log(data)
                if(('fileName' in data && data.fileName === fileName) || ('mydata') in data && data.mydata.fileName === fileName){
                    if (data.type == 'text') {
                        console.log('text')
                        writingS = true
                        quill.setContents(data.content, 'silent')
                        quill.setSelection(posS)
                        writingS = false
                    } else if (data.type == 'delta') {
                        console.log('delta')
                        writingS = true
                        deltaS = true
                        const delta = new Delta(data.real)
                        let diff = delta.diff(quill.getContents())
                        if (diff.ops.length && diff.ops[0].retain && data.content.ops[0].retain && diff.ops[0].retain < data.content.ops[0].retain) {
                            let old = data.content.ops[0].retain
                            let move = diff.transformPosition(data.content.ops[0].retain)
                            while (move != old) {
                                let diff = delta.diff(quill.getContents())
                                old = move
                                move = diff.transformPosition(data.content.ops[0].retain)
                            }
                            data.content.ops[0].retain = move
                        }
                        quill.updateContents(data.content, 'api')
                        deltaS = false
                        writingS = false
                    } else if (data.type == 'users') {
                        console.log('users')
                        cursors.clearCursors()
                        for (let i = 0; i < data.users.length; i++) {
                            if(data.users[i].fileName == fileName){
                                cursors.createCursor(i, data.users[i].name, data.users[i].color)
                                cursors.moveCursor(i, data.users[i].position)
                            }
                        }
                    }
                }
            }
        }
    }, [])

    return (
        <div>
            <div id="text-box">
                <div id="editor">
                    <p></p>
                </div>
            </div>
        </div>
    )
}

export default CodeEditor;