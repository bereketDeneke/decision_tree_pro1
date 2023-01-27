import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import {get_current_node, process_file, updateNode} from "./helper";
// import {
//   nodes as initialNodes,
//   edges as initialEdges
// } from "./contents";
import './style.css';
import { Handle, Position } from 'reactflow';
import { contents } from "./plain_content";

const proOptions = { hideAttribution: true };
const handleStyle = { left: 10 };
let dict = {};
let curr_line = [""];
let tree;
let index = 0;

const customNode  = ({ data }) => {
  try{
    const idx = data.idx;
    const plainText = data.label.props.children.split(';')
    const question = plainText[0]

    let items_list = [];
    if(plainText.length >= 2){
      items_list = ("," + plainText[1]).split(',').map(choice => choice.trim())
      items_list.push("Not Sure");
    }
    
    const onChange = useCallback((evt) => {
      const selected_value = evt.target.value;
      if(items_list.includes(selected_value)){
        let index = items_list.indexOf(selected_value);
        console.log(dict);
        dict = dict[curr_line[0]][index-1];

        curr_line = [Object.keys(dict)[0]];
        let childNodes = Object.values(dict[curr_line[0]]);
        let response = childNodes.map(child=> (typeof(child) == 'string') ? child : Object.keys(child)[0]).map(text=>(new RegExp('if(.*?),', 'g')).exec(text)[1]);
        response = response.map(string => string.trim());
      
        let content = `${curr_line[0]};${response.join(',')}`;
        let child = [{
          id: ""+index,
          type:"customN",
          data:{
            label:<>{content}</>,
            idx:""+index
          },
          position: { x: 250, y: 0 },
          style: {
            background: "#e6d5d5",
            color: "#333",
            border: "1px solid #222138",
            borderRadius: "4px",
            width: 180
          }
        }];

        tree.createNode(child);
      }
    }, []);

    const items = [];
    for (let i = 0; i< items_list.length; i++){
      items.push(<option>{items_list[i]}</option>)
    }

    return (
        <>
          <Handle type="target" id={idx} position={Position.Top} style={handleStyle} /> 
          <div className="box">
            <label htmlFor="text">{question}</label>
            { items_list.length > 2 &&
            <select id="text" name="text" onChange={onChange} >
              {items}
            </select>
            }
          </div>
          { items_list.length > 2 &&
          <Handle type="source" id={idx} position={Position.Bottom} style={handleStyle} /> 
          }
        </>
    );
  }catch(err){
    console.log("Error code "+ err);
  }
}

const NodeTypes = {customN: customNode}

const onInit = (reactFlowInstance) =>
  console.log("flow loaded:", reactFlowInstance);

  
const DecisionTree = () =>{
  // TODO: updating get_CurrentNode to support CART: formatting
  dict = process_file('Test Input');
  if(dict.hasOwnProperty('CART:'))
      dict = dict['CART:'];
  curr_line = [Object.keys(dict)[0]];
  console.log(curr_line[0]);
  let childNodes = Object.values(dict[curr_line[0]]);
  let response = childNodes.map(child=> (typeof(child) == 'string') ? child : Object.keys(child)[0]).map(text=>(new RegExp('if(.*?),', 'g')).exec(text)[1]);
  response = response.map(string => string.trim());

  let content = `${curr_line[0]};${response.join(',')}`;
  let Root = [{
    id: ""+index,
    type:"customN",
    data:{
      label:<>{content}</>,
      idx:""+index
    },
    position: { x: 250, y: 0 },
    style: {
      background: "#e6d5d5",
      color: "#333",
      border: "1px solid #222138",
      borderRadius: "4px",
      width: 180
    }
  }]

  const [nodes, setNodes, onNodesChange] = useNodesState(Root);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // const analyze = (d)=>console.log(d);
  tree = <ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  // onConnect={onConnect}
  // onNodeClick={addedge}
  proOptions = {proOptions}
  onInit={onInit}
  nodeTypes={NodeTypes}
  fitView
  attributionPosition="top-right"
>
  <MiniMap
    nodeStrokeColor={(n) => {
      // console.log(n.style)
      if (n.style?.background) return n.style.background;
      if (n.type === "customN") return "#e6d5d5";
      if (n.type === "input") return "#0041d0";
      if (n.type === "output") return "#ff0072";
      if (n.type === "default") return "#1a192b";

      return "#eee";
    }}
    nodeColor={(n) => {
      if (n.style?.background) return n.style.background;

      return "#fff";
    }}
    nodeBorderRadius={2}
  />
  <Controls />
  {/* <Background color="#aaa" gap={16} /> */}
</ReactFlow>

  return tree;
};

export default DecisionTree;
