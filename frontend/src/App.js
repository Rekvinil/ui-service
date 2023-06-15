import React, { useEffect, useState } from 'react';
import CodeEditor from './container/CodeEditor/CodeEditor.js'
import Navibar from './container/NavBar/Navibar.js';
import FileMenu from './container/FileMenu/FileMenu.js';
import ProjectList from './container/ProjectList/ProjectList.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import axios from 'axios';
import './App.css'

function App() {

  const [treeData, setTreeData] = useState();
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");

  const filesRequest = {
    id: "12345",
    type: "REQUEST_PROJECT_FILES",
    userId: "78020b71-da94-42fb-b9fb-f663e1132321",
    folderName: "example1"
  }

  async function fetchTree(){
    console.log(filesRequest)
    axios.post(`http://localhost:8083/api/files/getFiles`, filesRequest)
      .then(res => {
        console.log(res.data)
        setTreeData(res.data)
      })
  }

  const setContentCallback = (data, fileName) => {
    setContent(data)
    setFileName(fileName)
    console.log("data and fileName")
  }

  useEffect(() => {
    fetchTree()
  }, [])

  return (
    <div className="App">
        <Navibar />
        <div className='menu'>
          <FileMenu/>
        </div>
        <div className='working-place'>
          <div className='editor-file-container'>
            <ProjectList treeData = {treeData} setContentCallback = {setContentCallback}/>
          </div>
          <div className='code-editor'>
            <CodeEditor content = {content} fileName={fileName}/>
          </div>
        </div>
    </div>
  );
}

export default App;
