import React, { useCallback, useMemo } from "react";
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
const handleStyle = { left: 90 };
let dict = {};
let curr_line;
let index = 0;
let Root = [];
let content = "";


const onInit = (reactFlowInstance) =>
  console.log("flow loaded:", reactFlowInstance);

const DecisionTree = () =>{
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
        let previous_content  = content;
        const selected_value = evt.target.value;

        if(items_list.includes(selected_value)){
          let i = items_list.indexOf(selected_value);
          
          if(i==0 || dict==undefined)
            return;
          
          dict = dict[curr_line].content[i-1];
          if(dict==undefined)
            return;
          
          curr_line = Object.keys(dict)[0];
          if(typeof(dict.content)=="string"){
            content = dict.content;
          }else{
            let childNodes = Object.values(dict[curr_line].content);
            let response = childNodes.map(child=> (typeof(child.content) == 'string') ? child.content : Object.keys(child)[0]).map(text=>(new RegExp('if(.*?),', 'g')).exec(text)[1]);
            response = response.map(string => string.trim());
          
            content = `${curr_line};${response.join(',')}`;
          }

          let content_with_link = ((new RegExp('http(.*?) ', 'g')).exec(content+" ")||[])[0];
          console.log(content_with_link)
          let jsx_elm = (content_with_link==undefined) ? '': <a href={content_with_link.trim()}>{content_with_link}</a>;
          let link_index = (content_with_link==undefined) ? 0 : content.indexOf(content_with_link.trim());
          content_update = (content_with_link==undefined) ? content.substring: content.replace(content_with_link.trim(), '');
          let result =  (content_with_link==undefined) ? content :content.replaceAll(content_with_link.trim(), jsx_elm);
          console.log(result);
          let child = {
            id: ""+content,
            type:"customN",
            data:{
              label:<>{result}</>,
              idx:""+content,
              level: dict[curr_line].level
            },
            position: { x: 400, y: 0 },
            style: {
              background: "#D6D5E6",
              color: "#333",
              border: "1px solid #222138",
              borderRadius: "4px",
              width: 180,
              fontSize:'20vh',
            }
          };
          
          setNodes((els)=>{
            return [
              ...els,
              child];
          });

          setEdges((eds)=>{
            return[
              ...eds,
              {
                id:'ed-'+content,
                source:previous_content,
                target:content,
                markerEnd:{type:MarkerType.ArrowClosed}
              }
            ]
          });
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
  
  const NodeTypes =useMemo(() => ({ customN: customNode }), []); 
  const init = (param)=>{
     // TODO: updating get_CurrentNode to support CART: formatting
     dict = process_file('Test Input');
     if(dict.hasOwnProperty('CART:'))
         dict = dict['CART:'];
   
     curr_line = Object.keys(dict)[0];
     let childNodes = Object.values(dict[curr_line].content);
     console.log(childNodes);
     let response = childNodes.map(child=> (typeof(child.content) == 'string') ? child.content : Object.keys(child)).map(text=>(new RegExp('if(.*?),', 'g')).exec(text)[1]);
     response = response.map(string => string.trim());
   
    content = `${curr_line};${response.join(',')}`;
     Root = {
       id: ""+content,
       type:"customN",
       data:{
         label:<>{content}</>,
         idx:""+content,
         level: dict[curr_line].level
       },
       position: { x: 250, y: 0 },
       style: {
         background: "#e6d5d5",
         color: "#333",
         border: "1px solid #222138",
         borderRadius: "4px",
         width: 180,
         height:'fit-content'
       }
       
     };

      setNodes((els)=>{
        return [
          ...els,
          Root];
      });
      index++;
    }

  return <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    proOptions = {proOptions}
    onInit={init}
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
};

export default DecisionTree;
