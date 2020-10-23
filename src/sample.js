/**
    * Sample of buttons for the Block plugin
    *
    * @property {EditorJS} editor - an instance of Editor.js with SoSIE menubar
    */
function sampleBlock(editor) {
 
    if(editor.hasOwnProperty('sosie')) { 
    
        let sosie=editor.sosie;
        
        //  Add your button here
        /* <a style="padding-right:0;padding-left:0;">
            <span class="fa-stack fa-lg"  style="font-size:12px" id="gotoPosition" title="Goto" >
                                    <i class="fa fa-bars fa-stack-2x"></i>
            </span>
            <input id="currentPosition" title="Current position" type="text" style="width:2em" size="3" value="" placeholder="?" readonly>/<input id="totalBlocks" title="Total Blocks" type="text" style="width:2em" size="3" value="" placeholder="?" readonly>
      </a></li>*/
        
        
        /**
        *  Position Panel 
        */
        editor.sosie.addMenuIconBtn({   
            icon:'bars',
            id:'gotoPosition',
            title:'Goto',
            text:'',
            onClick: [function(evt){ return gotoBlockPosition()}, false],
            custom: [
                {
                    input: {
                        id:'currentPosition', 
                        title:'Current position',
                        type:'text', 
                        style:'width:2em',
                        size:'3', 
                        value:'',
                        placeholder:'?',
                        readonly:'readonly'
                    }
                },
                '/',
                {
                   input: {
                        id:'totalBlocks', 
                        title:'Total Blocks',
                        type:'text', 
                        style:'width:2em',
                        size:'3', 
                        value:'',
                        placeholder:'?',
                        readonly:'readonly'
                    }
                }
            ]
        });

    }
}

