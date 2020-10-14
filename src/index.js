/**
* Block position tracking plugin
*
* @Note this has to be triggered after await editor.isReady
* @author sosie / sos-productions.com
* @see remark in issue https://github.com/codex-team/editor.js/issues/1258
* @version 3.0
* @history
*    1.0 (05.10.2020) - Initial version from SoSIE
*    2.0 (09.10.2020) - Refactoring init(editor) , add/remove BlocksPositionListeners works
*    3.0 (14.10.2020) - initCaretManager added os saving, restoring caret position for injections works
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
     *@internal This may surely be done less 'hookely'...from editor instance instead like
     * 
     *  initGetBlockNodeList(editor) {
     * 
     *   editor.getBlocksNodeList = function() {
     *       let blocks=[], b, bMax=editor.blocks.getBlocksCount();
     *       for (b = 0; b < bMax ; b ++) {
     *           blocks.push(editor.blocks.getBlockByIndex(b));
     *       }
     *       return blocks;
     *   }
     *  
     *  } BUT IT DOES NOT WORK with addEventListener
     * 
     * If you know a cleaner and faster way please inform me. - SoSIE
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
    
    
  /**
    * Determines the position (index+1) of the given Block DOMElement
    * 
    * @note return editor.blocks.getCurrentBlockIndex(); + 1 only if block is current selected,
    * Of course we could have mad a traversal of blocks to find which one matches block
    * @param {HTMLDivElement} block
    * @return {number} 
    */
    getPosition(block) {
      
        // Compensates editor.blocks.array() as not available in BlockAPI
        var blocks = this.editor.getBlocksNodeList();
        
        // Compensates editor.blocks.indexOf(block: Block) as not available in BlockAPI
        var p,n=Array.prototype.indexOf.call(blocks, block);
        
        if(n==undefined) {
            p='?';
        }else {   
            p=n+1;
        }
        return p;
    }
    
    /**
     * Install Listeners on each block to determine the position on which block has been clicked and track changes add, remove and updates  
     * 
    *@param  {Object} editor - Editor.js API
    */
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
            
            let caret=_this.getSelectionCharacterOffsetWithin(e.target); 
            blockSelection.in=caret.in;
            blockSelection.out=caret.out; 
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
     *@author https://ourcodeworld.com/articles/read/282/how-to-get-the-current-cursor-position-and-selection-within-a-text-input-or-textarea-in-javascript
     *@description Add Clipboad support to determine if we are in collapsed mode, ie meaning if a block range is select, start and end matches.    
     *@note editor.clipboard.blockSelection will provide the last block range selected position {start:'?',end:'?'}
     *@param  {Object} editor - Editor.js API
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
      * @note SoSIE menu bar specific 
      * @param  {Object} editor - Editor.js API
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
    
    /**
    * Plugin extra caret position helpers and injector 
    *    
    * @param  {Object} editor - Editor.js API
    **/
    initCaretManager(editor) {
      
        // Move caret to a specific point in a DOM element
        // Works for ContentEditable
        // https://stackoverflow.com/questions/36869503/set-caret-position-in-contenteditable-div-that-has-children
        function setCaretPosition(el, pos){

            // Loop through all child nodes
            for(var node of el.childNodes){
                if(node.nodeType == 3){ // we have a text node
                    if(node.length >= pos){
                        // finally add our range
                        var range = document.createRange(),
                            sel = window.getSelection();
                        range.setStart(node,pos);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        return -1; // we are done
                    }else{
                        pos -= node.length;
                    }
                }else{
                    pos = setCaretPosition(node,pos);
                    if(pos == -1){
                        return -1; // no need to finish the for loop
                    }
                }
            }
            return pos; // needed because of recursion stuff
        }
        
        /**
        * Set caret position within the block of the given index
        * @param {number} index - the block index 
        * @param {number} caret - the caret position
        **/
        this.setCaretPosition = function (index, caret) {
            var blocks=editor.getBlocksNodeList();
            var blockTarget=blocks[index];
            setCaretPosition(blockTarget, caret);
        }
        
         /**
        * Return an object with the selection range or cursor position (if both have the same value)
        * 
        * @param {DOMElement} el A dom of a ContentEditable element
        * @see https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
        * @return {Object} reference Object with 2 properties (start and end) with the identifier of the location of the cursor and selected text. (as {in: , out:}) 
        **/
         this.getSelectionCharacterOffsetWithin = function (element) {
            var start = 0;
            var end = 0;
            var doc = element.ownerDocument || element.document;
            var win = doc.defaultView || doc.parentWindow;
            var sel;
            if (typeof win.getSelection != "undefined") {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    var range = win.getSelection().getRangeAt(0);
                    var preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(element);
                    preCaretRange.setEnd(range.startContainer, range.startOffset);
                    start = preCaretRange.toString().length;
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    end = preCaretRange.toString().length;
                }
            } else if ( (sel = doc.selection) && sel.type != "Control") {
                var textRange = sel.createRange();
                var preCaretTextRange = doc.body.createTextRange();
                preCaretTextRange.moveToElementText(element);
                preCaretTextRange.setEndPoint("EndToStart", textRange);
                start = preCaretTextRange.text.length;
                preCaretTextRange.setEndPoint("EndToEnd", textRange);
                end = preCaretTextRange.text.length;
            }
            return { in: start, out: end };
        }
        
        /**
        * Helper to inject the Embed block inline at the start on selection
        * 
        * @note injection ie in selection place, no need to hiligh some chars to make inline tools appears
        * @param {Element} el the element to inject
        **/
        this.inlineInjector = function (el) {
  
          var sel, range;
          if (window.getSelection && (sel = window.getSelection()).rangeCount) {
              range = sel.getRangeAt(0);
              range.collapse(true);
              
              range.insertNode(el);

              // Move the caret immediately after the inserted toolBlock
              range.setStartAfter(el);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
              
              console.log('Block now injected inline');
              
          } else {
            alert('Specify first a position with the caret by clicking inside a block');
          }
          
        }
    }
      
        
    /* Initialisation entry point */    
    init(editor) {
        
        this.editor=editor;
        
        // Add Clipboad support to determine if we are in collapsed mode, ie meaning if a block range is select, start and end matches.
        this.initClipboard(editor);
        
        // Hook to get Node Block list
        this.initGetBlockNodeList(editor);
        
        // SoSIE menu bar specific 
        this.initBlockStatutPositionPanel(editor);
    
        // Listeners on each block to determine the position on which block has been clicked and track changes add, remove and updates 
        this.initBlocksPositionListeners(editor);
        
        // primitives to set to a position /get caret from selection
        this.initCaretManager(editor);
    
        console.info('Block plugin initialized');
    }
}

window.Block=new BlockPlugin();

//Register so SoSIE will autoinit.    
SoSIE.register('Block');
