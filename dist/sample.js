function sampleBlock(t){if(t.hasOwnProperty("sosie")){t.sosie;t.sosie.addMenuIconBtn({icon:"bars",id:"gotoPosition",title:"Goto",text:"",onClick:[function(t){this.firstChild.lastChild.click(),t.stopPropagation()},!1],custom:[{input:{id:"currentPosition",title:"Current position",type:"text",style:"width:2em",size:"3",value:"",placeholder:"?",readonly:"readonly"}},"/",{input:{id:"totalBlocks",title:"Total Blocks",type:"text",style:"width:2em",size:"3",value:"",placeholder:"?",readonly:"readonly"}}]}),initBlocksPositionListeners(),refreshTotalBlocks()}}