/**
* Block position tracking plugin
*
* @Note this has to be triggered after await editor.isReady
* @author sos-productions.com
* @see remark in issue https://github.com/codex-team/editor.js/issues/1258
* @version 2.0
* @history
*    1.0 (05.10.2020) - Initial version from SoSIE
*    2.0 (09.10.2020) - Refactoring init(editor) , add/remove BlocksPositionListeners works
* @property {Object} editor - Editor.js API 
**/


/**
 * Block position retrieval and changes tracking for Editor.js.
 *
 * @typedef {Object} BlockPlugin
 * @description BlockPlugin will be intiatlised not in the constructor but lately with .init(editor)
 * called indiretly SoSIE when Editor and Menubar dom are both available
 */
class BlockPlugin {
        
    constructor() {}
    
    /**
     * Extends api with scroll to block n facility 
     * 
     *@note this is for now more used in fact as 
     * we used editor.caret.setToBlock instead however
     * I keep the code because it provides a way to
     * avoid to change caret to position on the block
     *@param {Object} editor - Editor.js API
     **/
    initScrollToBlock(editor) {
        
            function getEditorDom() {
                return window.document.getElementById('editorjs');
            }

            function getBlocksDom(edom) {
                return edom.firstChild.firstChild.children;
            }

            function getEditorBlocks() {
                var edom=getEditorDom();
                return getBlocksDom(edom);
            }
            
            editor.blocks.scrollToBlock=function(n,v) {
                    var blocks=getEditorBlocks();
                    if(n<blocks.length) {
                        if(v>0) {
                            window.scrollTo(0,blocks[n].offsetTop-v);
                        }else {
                            blocks[n].scrollIntoView(true);
                        }
                    }
            }; 
            
            window.gotoBlockPosition=function() {
                let pos = prompt("Go to position","1");
                var e='Invalid Position, it must be in integer from 1 to '+editor.blocks.getBlocksCount();
                try {
                    var n,p=parseInt(pos);
                    if(p>0) {    
                        n=p-1;
                        /*const edom=window.document.getElementById('editorjs');
                        let blocks=edom.firstChild.firstChild.children;
                        blocks[n].scrollIntoView(true); 
                        blocks[n].focus();*/
                        //editor.blocks.scrollToBlock(n,0);
                        editor.caret.setToBlock(n, 'start');
                        
                        setCurrentPosition(p);
                        refreshTotalBlocks();
                        
                    }else {
                        alert(e);
                    }
                } catch {
                    alert(e);
                }
                
            }
    }
    
    /**
     * Extends editor with GetBlockNodeList
     * 
     *@description Hook to get Node Block list
     *@internal This may surely be done less 'hookely'...from editor instance instead.
     * Let say with nodejs, accessing to js editor dom is such a bunker 
     * so I even spent a second trying to do so. If you know a cleaner 
     * and faster way please inform me. - SoSIE
     *@note editor.getBlocksNodeList function will be available
     *@param  {Object} editor - Editor.js API
     ***/ 
    initGetBlockNodeList(editor) {
        
            editor.getBlocksNodeList = function() {
        
            function getRedactor() {
                    //console.log(document.getElementsByClassName("codex-editor__redactor")); //Live, HTMLCollecton will not work
                    return document.querySelectorAll('.codex-editor__redactor')[0]; //NodeList that contains static NodeList usable.
            }

            var redactor=getRedactor();
            var blocks=redactor.childNodes; //NodeList <div class="ce-block" or class="ce-block focused" 
            return blocks;
            
        }
    }
    
    
    getPosition(block) {
        var blocks = this.editor.getBlocksNodeList();
        var p,n=Array.prototype.indexOf.call(blocks, block); 
        //Do your stuff!
        if(n==undefined) {
            p='?';
        }else {   
            
            p=n+1;
        }
        console.log("getPosition",{fromN: n , gives: p});
        return p;
    }
    
    initBlocksPositionListeners(editor) {
        
        var _this=this;
        var blockSelection=editor.clipboard.blockSelection;
        
        var addBlockClickListener = function(e){
                    
                var p=_this.getPosition(this);
                
                //Update the panel
                setCurrentPosition(p);
                refreshTotalBlocks();
            /*   if(p != '?') {
                    // broadcast message to others editors so they will synchronize on the same block's position
                    var rect=blocks[p-1].getBoundingClientRect();
                    editor.broadcast.postMessage({
                        action:'sync',
                        position:p,
                        y : rect.top
                    });
                }*/
        }
        
        var addBlockMouseDownListener = function(e){
                blockSelection.start=_this.getPosition(this);
                blockSelection.end='?';
        }
        
        var addBlockMouseUpListener = function(e){
            var end=_this.getPosition(this);
            if(blockSelection.start == end) { //We have to check if there is REALLY a selection within the block
                var currSelection = window.getSelection();
                if((currSelection.rangeCount >0)&&(currSelection.getRangeAt(0) != '')) { 
                    blockSelection.end=end;
                }
            } else {
                blockSelection.end=end;
            }
            console.log(blockSelection);
            //refreshCopyBtn();
        }
        
        /**
            * 
            *@param {HTMLDivElement} block - NodeList of div class="ce-block" or class="ce-block
            **/
        editor.blocks.addBlockPositionListeners = function(block) {
            
                block.addEventListener('click', addBlockClickListener);
                block.addEventListener('mousedown', addBlockMouseDownListener) ;
                block.addEventListener('mouseup', addBlockMouseUpListener);
                
                console.info("Position Listeners added on block ", block.dataset.blockId);
                
        }
        
        /**
            * 
            *@param {HTMLDivElement} block - NodeList of div class="ce-block" or class="ce-block
            **/ 
        editor.blocks.delBlockPositionListeners = function (block) {
            
                block.removeEventListener('click',addBlockClickListener);
                block.removeEventListener('mousedown', addBlockMouseDownListener) ;
                block.removeEventListener('mouseup', addBlockMouseUpListener);
                
                console.info("Position Listeners removed on block", block.dataset.blockId);
        }
        
        function installBlocksPositionListeners(blocks) {
        
            //var blocks = //editor.getBlocksNodeList();
            for(var i = 0, len = blocks.length ; i < len ; i++) {
                editor.blocks.addBlockPositionListeners(blocks[i]);
            }
            
            editor.on('keypress', function(e){
                //alert(e.keyCode);
                if (e.keyCode == 27) //ESC
                    setCurrentPosition("");
            });
        }
        
        var blocks=editor.getBlocksNodeList();
        installBlocksPositionListeners(blocks);
        
        //Blocks Listener(s) may need to be upated on enter or remove,
        //!NOTE requires the editorjs-Undo patch to work
        document.addEventListener('changeBlocks', function(evt){
            var changedSet=evt.detail.changed;
            changedSet.forEach(entry => {
                //console.log('changeBlocks',entry);
                var block=entry.blockElement;
                var blockId=block.dataset.blockId;
                var blockData= block.innerText ? [block.innerText] : block;
                switch(entry.changeType) {
                    case 'add':
                        console.log('Block ('+blockId+') added', blockData);
                        editor.blocks.addBlockPositionListeners(block);
                    break;
                    case 'remove':
                        console.log('Block ('+blockId+') removed', blockData);
                        editor.blocks.delBlockPositionListeners(block);
                    break;
                    case 'update':
                    default:
                        console.log('Block ('+blockId+') updated', blockData);
                }
            });
        });
    
    }
        
    /**
     * Extends editor with Block Clipboard facility
     * 
     *@description Add Clipboad support to determine if we are in collapsed mode, ie meaning if a block range is select, start and end matches.    
     *@note editor.clipboard.blockSelection will provide the last block range selected position {start:'?',end:'?'}
     **/
    initClipboard(editor) {
            
        function Clipboard() {
    
            //blocks range for the selection
            this.blockSelection={start:'?',end:'?'};
            
            //current blocks selected with their relevant indexes
            this.data={};
            
            this.clear=function() {
                this.data={indexes:[],blocks:[]}; 
                return this.data;
            }
            
            this.clear();
        }
        
        //kept for info but unused
        function getSelectionText() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            return text;
        }   
        
        editor.clipboard=new Clipboard();
    }
        
     /**
      * Statut Position Panel primitives
      * 
      *@note SoSIE menu bar specific 
      **/   
    initBlockStatutPositionPanel(editor) {
    
        window.setCurrentPosition = function(value) {
            document.getElementById('currentPosition').value=value;
        }  
    
        window.refreshCurrentPosition = function() {
            var p=editor.blocks.getCurrentBlockIndex()+1;
            console.warn("CURRENT POS",p);
            setCurrentPosition(p);
        }
        
        
        window.refreshTotalBlocks = function() {
            document.getElementById('totalBlocks').value= editor.blocks.getBlocksCount();
        }
        
        //Required by onChange
        window.refreshBlocksStatusPanel = function() {
            refreshCurrentPosition();
            refreshTotalBlocks();
        }
        
        //Used by goto position function
        this.initScrollToBlock(editor);
    }
        
    /* Initialisation entry point */    
    init(editor) {
        
        this.editor=editor;
        
        //Add Clipboad support to determine if we are in collapsed mode, ie meaning if a block range is select, start and end matches.
        this.initClipboard(editor);
        
        //Hook to get Node Block list
        this.initGetBlockNodeList(editor);
        
        // SoSIE menu bar specific 
        this.initBlockStatutPositionPanel(editor);
    
        //Listeners on each block to determine the position on which block has been clicked and track changes add, remove and updates 
        this.initBlocksPositionListeners(editor);
    
        console.info('Block plugin initialized');
    }
}

window.Block=new BlockPlugin();

//Register so SoSIE will autoinit.    
SoSIE.register('Block');
