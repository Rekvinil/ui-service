import React, {useState, Component, useEffect} from 'react';
import { Tree } from 'antd';

const { DirectoryTree } = Tree;

function range(start, end) {
  var ans = [];
  for (let i = start; i <= end; i++) {
      ans.push(i);
  }
  return ans;
}

function ProjectList(props) {
  const [treeData, setTreeData] = useState([]);
  console.log(props)
  const onSelect = (keys, info) => {
    console.log('Trigger Select', keys, info);
    if(keys[0].includes("http")){
      downloadFileAndGetContent(keys[0])
    }

  };
  const onExpand = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };

  useEffect(() => {
    console.log("triggered")
    if(props.treeData !== undefined && 'result' in props.treeData){
      console.log("triggered 2")
      parseTreeData(props.treeData.result)
    }
  }, [props.treeData]
  )

  function parseTreeData(trData){
    if(trData === undefined){
      return
    }
    var obj =
      {
        title: trData.projectName,
        key: trData.projectName,
      }

    obj.children = addChildren([], trData.fileList, trData.fileLinks)
    console.log(obj)
    setTreeData([obj])
  }

  function addChildren(children, fileList, fileLinks){
    console.log(fileList)
    for(let file of fileList){
      let arr = file.split('/').reverse()
      let a = {title: arr[0], key: fileLinks[arr[0]], isLeaf: true}
      let flag = false
      if(arr.length > 2){
        for(let i in range(1, arr.length-1)){
          let f = searchChildren(children, arr[i])
          if(f !== undefined){
            f.children.push(a)
            flag = true
          } else {
            if(a.title !== arr[i]){
              a = {title: arr[i], key: arr[i], children: [a]}
            }
          }
        }
      }
      if(!flag){
        children.push(a)
      }
    }
    return children
  }

  function searchChildren(children, name){
    if(children.length !== 0){
      for(let child of children){
        if('title' in child){
          if(child.title === name){
            return child
          }
        }
        if('children' in child){
          return searchChildren(child.children, name)
        }
      }
    }
  }

  function downloadFileAndGetContent(link){
    const url = new URL(link)
    const AWS = require('aws-sdk');
    var client = new AWS.S3({
      accessKeyId: 'admin',
      secretAccessKey: 'password',
      endpoint: 'http://' + url.hostname + ":9000",
      s3ForcePathStyle: true, // needed with minio?
      signatureVersion: 'v4'
    })
    var path = url.pathname.substring(1).split("/")
    var bucket = path.shift()
    var pathToFile = path.join('/')
    console.log(bucket)
    console.log(pathToFile)
    client.getObject({ Bucket: bucket, Key: pathToFile }, function(err, data){
      if(err) console.log(err);
      else {
        var data = Buffer.from(data.Body).toString('utf8')
        props.setContentCallback(data, pathToFile.split("/").reverse()[0]);
        console.log(props)
        console.log(data)
      }
    });
  }

    return ( 
      <DirectoryTree
      multiple
      defaultExpandAll
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
    />
     );
}

export default ProjectList;