import React, { StrictMode, useState } from 'react';
import { createRoot } from "react-dom/client";
import { View, Text, Button, StyleSheet, Dimensions, Platform, ScrollView, TouchableOpacity} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import base64 from 'react-native-base64';
import DecisionTree from './dtree';
import './style.css';
import { CheckBox } from 'react-native-web';
import {topics, contents} from './plain_content';

// TODO: implementing debugging feature from homepage.js 
// TODO: scroll to where there is an error on the indentation

// process();
const TextFileInput = () => {
    const [textFile, setTextFile] = useState(null);
    
    const pickTextFile = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: 'text/plain', /// application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        if (result.type === 'success') {
           let res = base64.decode(result.uri.split('base64,')[1]);
           setTextFile(res);
        } 
    };

    const [selectedCheckbox, setSelectedCheckbox] = useState(null);

    const handleCheckboxChange = (id) => {
      setSelectedCheckbox(id);
      setTextFile(contents[id]);
    }

    const Options = [];  
    for(let index = 0; index < topics.length; index++) {

      Options.push( 
        <View style={{
          flex:1, 
          flexDirection:'row',
          alignSelf: 'flex-start',
          marginHorizontal: '1%',
          minWidth: 'fit-content',
          }}>
            <CheckBox
              style = {styles.checkbox}
              key={index}
              value={selectedCheckbox === index}
              onValueChange= {() => handleCheckboxChange(index)}
              label={topics[index]}
            />
            <TouchableOpacity onPress= {() => handleCheckboxChange(index)} style={styles.label}><>{topics[index]}</></TouchableOpacity>
        </View>
      );
    }

    return (
      <> 
          {!textFile &&
            <View style= {styles.container}> 
              <Text style={styles.text}>
                    Choose any of the following or upload new topic
              </Text>
            </View>
          }
          
          {textFile &&
              <ScrollView style={styles.container}>
                  <Text style={styles.text}>
                    {textFile}
                  </Text>
              </ScrollView>
          }
          <View style={styles.btn}>
            <Button title="Upload File" color="#DfC2A4" style={{    
                borderRadius: 10, 
                borderWidth: 1,
                borderColor: '#fff',
                overflow:'hidden',
                shadowColor: '#fff',
              }} onPress={pickTextFile} />
            
            <View style={{
              flex:1, 
              flexDirection:'row', 
              width:'100%',
              flexWrap: 'wrap'

              }}>

              {
                Options
              } 
            </View>
          </View>
      </>
    );
};


const App = ()=>{
  const [next_page, next] = useState(null)
  const select = ()=> next(true)
  const returnBtn = ()=> next(null)

  return (  
    <View style={styles.app}>
      {
        next_page && <div className='App'><DecisionTree/></div>
      }

      {
        !next_page && <TextFileInput/>
      }

      {
        !next_page && 
          <View style={styles.btn}>
                <Button title="Submit" color="#DfC2A4" style={{    
                    borderRadius: 10, 
                    borderWidth: 1,
                    borderColor: '#fff',
                    overflow:'hidden',
                    shadowColor: '#fff',
                  }} onPress={select} />
          </View>
      }

      {
        next_page &&
        
        <View style={styles.btn}>
                <Button title="Back" color="#DfC2A4" style={{    
                    borderRadius: 10, 
                    borderWidth: 1,
                    borderColor: '#fff',
                    overflow:'hidden',
                    shadowColor: '#fff',
                  }} onPress={returnBtn} />
          </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  app:{
    flex: 1,
    flexDirection: 'col',
    justifyContent: 'flex-start',
    alignItems: 'start',
    backgroundColor:"#EEEEEE", 
    height:Dimensions.get('window').height
  },
  container:{
    alignSelf:'center',
    backgroundColor:"#fff",
    maxHeight: 450,
    minHeight:450,
    minWidth: 100,
    rowGap:1,
    
    width:Dimensions.get('window').width - 39,
    borderRadius: 7,
    shadowColor: '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 1.2,
    elevation: .6,
    margin:10,
  },
  text: {
    fontSize: 20,
    textAlign:'start',
    margin: 10,
    padding: 20,
    lineHeight: 30,
    maxWidth: Dimensions.get('window').width,// Dimensions.get(Platform.OS).width,
    backgroundColor: 'white',
    overflow:'hidden',
},
  btn:{
    width: 200,
    marginLeft: 5,
    marginBottom: 10,
    alignItems:'start',
  },

  checkbox: {
    top:12,
    fontSize:18,
    alignSelf: 'start',
  },
  label: {
    fontSize:18,
    margin: 8,
  },
});

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// export default App;