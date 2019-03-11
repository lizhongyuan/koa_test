'use strict';


const xmlreader = require("xmlreader");


let xmlStr =
  '<xml> \
    <ToUserName>toUser</ToUserName> \
    <AgentID>toAgentID</AgentID> \
    <Encrypt>msg_encrypt</Encrypt> \
   </xml>';


xmlreader.read(xmlStr, (err, res) => {
  if (err) {
    console.log(err);
  }
  
  const keys = Object.keys(res.xml.attributes());
  const count = Object.keys(res.xml.count());
  const text = Object.keys(res.xml.text());
  
  console.log(res.xml.ToUserName.text());
  console.log(res.xml.AgentID.text());
  console.log(res.xml.Encrypt.text());
  // console.log(res.xml.text());
  // console.log(res.xml.text());

});

