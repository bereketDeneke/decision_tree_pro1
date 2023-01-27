export const updateNode = (id, value)=>{
    console.log(id, value);
    return 34;
}

import { contents, topics } from "./plain_content";

// export const process = ()=>{
//     let dict = process_file('Test Input');
//     if(dict.hasOwnProperty('CART:')){
//         dict = dict['CART:'];
//         console.log(dict);
//     }
//     ask_me(dict);
// }

// function ask_me(dict){
//     if(typeof(dict)=="string" || Object.keys(dict)==0)
//         return;

//     for(let i=0; i< Object.keys(dict).length; i++){
//         let curr_line = Object.keys(dict)[i];
//         console.log(curr_line);
//         let childNodes = Object.values(dict[curr_line]);
//         let response = childNodes.map(child=> (typeof(child) == 'string') ? child : Object.keys(child)[0]).map(text=>(new RegExp('if(.*?),', 'g')).exec(text)[1]);
//         response = response.map(string => string.trim());
//         let input = prompt(response);
        
//         if(response.includes(input)){
//             let index = response.indexOf(input);
//             let new_dict = dict[curr_line][index];
//             console.log(new_dict);
//             return ask_me(new_dict);
//         }
//     }
// }

export const get_current_node = (dict)=>{
    if(dict==undefined || typeof(dict)=="string" || Object.keys(dict)==0)
        return false; // false means the dict contains string or nothing

    for(let i=0; i< Object.keys(dict).length; i++){
        let curr_line = Object.keys(dict)[i];
        console.log(curr_line);
        let childNodes = Object.values(dict[curr_line]);
        let response = childNodes.map(child=> (typeof(child) == 'string') ? child : Object.keys(child)[0]).map(text=>(new RegExp('if(.*?),', 'g')).exec(text)[1]);
        response = response.map(string => string.trim());
        let input = prompt(response);
        
        if(response.includes(input)){
            let index = response.indexOf(input);
            let new_dict = dict[curr_line][index];
            return new_dict;
        }
    }
}

export const process_file = (topic_title = "Cart")=>{
    let topic_content = contents[topics.indexOf(topic_title)].split('\n');
    topic_content = topic_content.map(line => line.trim());

    let match_word = (topic_content[0].includes('CART')) ? '|': '--';
    const len_of_indent = (str)=>(str.match(new RegExp(match_word, "g")) || []).length; 
    const exceptional_len_of_indent = (str)=>str.split('').filter(x=> x == match_word).length;
    const _callback = (topic_content[0].includes('CART')) ? exceptional_len_of_indent: len_of_indent;

    let rootNode = new Node(topic_content[0], _callback, match_word);
    rootNode.add_child(topic_content.slice(1,).map(x=>new Node(x,  _callback, match_word)));
    let dict = rootNode.get_result();
    
    return dict;
}

class Node{
    constructor(indented_line, _callback, match_word = '--'){
        this.Children = [];
        this.match_word = match_word;
        this.level = this.find_sizeof_indent(indented_line, _callback); 
        this.text = indented_line.replaceAll(this.match_word, '').replaceAll('-', '').trim();
    }

    add_child(nodes){
        let child_level = nodes[0].level;

        while(nodes){
            try{
                let node = nodes.shift();
                if(node == undefined)
                    return;
                if(node.level == child_level){
                    this.Children.push(node)
                }else if(node.level > child_level){
                    nodes.unshift(node);
                    this.Children[this.Children.length - 1].add_child(nodes);
                    
                }else if(node.level <= child_level){
                    nodes.unshift(node);
                    return;
                }
            }catch(e){
                console.log(e);
                return;
            }
        }
    }

    find_sizeof_indent = (str, _callback) => _callback(str); 
    get_result(){
        if(this.Children.length > 1){
            let result = [];
            for(let i in this.Children){
                let node = this.Children[i];
                result.push(node.get_result());
            }
            let dict = {};
            dict[this.text] = result
            return dict;
        }else if(this.Children.length == 1){
            let dict = {};
            dict[this.text] = this.Children[0].get_result();
            return dict;
        }else{
            return this.text;
        }
    }
};