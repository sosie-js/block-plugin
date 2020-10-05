Block.init = (editor) => {

    
    function getRedactor() {
            //console.log(document.getElementsByClassName("codex-editor__redactor")); //Live, HTMLCollecton will not work
            return document.querySelectorAll('.codex-editor__redactor')[0]; //NodeList that contains static NodeList usable.
    }
    
    function getBlocksNodeList() {
            var redactor=getRedactor();
            return redactor.childNodes; //NodeList <div class="ce-block" or class="ce-block focused" 
    }


    function getPosition(block) {
            var blocks = getBlocksNodeList();
            var p,n=Array.prototype.indexOf.call(blocks, block); 
            //Do your stuff!
            if(n==undefined) {
                p='?';
            }else {    
                p=n+1;
            }
            return p;
    }
        
    function setCurrentPosition(value) {
        document.getElementById('currentPosition').value=value;
    }    
        
    function addBlockPositionListeners(blocks,i) {
    
        blocks[i].addEventListener('click', function(e){
            
                    var p=getPosition(this);
                    
                    //Update the panel
                    setCurrentPosition(p);
                    
                    if(p != '?') {
                        // broadcast message to others editors so they will synchronize on the same block's position
                        var rect=blocks[p-1].getBoundingClientRect();
                        editor.broadcast.postMessage({
                            action:'sync',
                            position:p,
                            y : rect.top
                        });
                    }
            })
            
            blocks[i].addEventListener('mousedown', function(e){
                    blockSelection.start=getPosition(this);
                    blockSelection.end='?';
            })
            
            blocks[i].addEventListener('mouseup', function(e){
                        var end=getPosition(this);
                        if(blockSelection.start == end) { //We have to check if there is REALLY a selection within the block
                            var currSelection = window.getSelection();
                            if((currSelection.rangeCount >0)&&(currSelection.getRangeAt(0) != '')) { 
                                blockSelection.end=end;
                            }
                        } else {
                            blockSelection.end=end;
                        }
                        console.log(blockSelection);
                        refreshCopyBtn();
            })
            
            
    }
            
            
    function initBlocksPositionListeners() {
        var blocks = getBlocksNodeList();
        for(var i = 0, len = blocks.length ; i < len ; i++) {
            addBlockPositionListeners(blocks,i);
        }
        
        editor.on('keypress', function(e){
            alert(e.keyCode);
            if (e.keyCode == 27) //ESC
                setCurrentPosition("");
        });
    }
    
   
           
            
    function refreshCurrentPosition() {
        setCurrentPosition(editor.blocks.getCurrentBlockIndex()+1);
    }
    
    function refreshTotalBlocks() {
        document.getElementById('totalBlocks').value=editor.blocks.getBlocksCount(); 
    }
    
    function refreshBlocksStatusPanel() {
        refreshCurrentPosition();
        refreshTotalBlocks();
    }
   
   
}

//Register so SoSIe will autoinit.    
SoSIE.register('Block');
