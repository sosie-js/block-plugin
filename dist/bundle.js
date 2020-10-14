class BlockPlugin{constructor(){}initScrollToBlock(e){function t(){return function(e){return e.firstChild.firstChild.children}(window.document.getElementById("editorjs"))}e.blocks.scrollToBlock=function(e,o){var n=t();e<n.length&&(o>0?window.scrollTo(0,n[e].offsetTop-o):n[e].scrollIntoView(!0))},window.gotoBlockPosition=function(){let t=prompt("Go to position","1");var o="Invalid Position, it must be in integer from 1 to "+e.blocks.getBlocksCount();try{var n,i=parseInt(t);i>0?(n=i-1,e.caret.setToBlock(n,"start"),setCurrentPosition(i),refreshTotalBlocks()):alert(o)}catch{alert(o)}}}initGetBlockNodeList(e){e.getBlocksNodeList=function(){return document.querySelectorAll(".codex-editor__redactor")[0].childNodes}}getPosition(e){var t=this.editor.getBlocksNodeList(),o=Array.prototype.indexOf.call(t,e);return null==o?"?":o+1}initBlocksPositionListeners(e){var t=this,o=e.clipboard.blockSelection,n=function(e){var o=t.getPosition(this);setCurrentPosition(o),refreshTotalBlocks()},i=function(e){o.start=t.getPosition(this),o.end="?"},s=function(e){var n=t.getPosition(this);if(o.start==n){var i=window.getSelection();i.rangeCount>0&&""!=i.getRangeAt(0)&&(o.end=n)}else o.end=n;let s=t.getSelectionCharacterOffsetWithin(e.target);o.in=s.in,o.out=s.out,console.log(o)};e.blocks.addBlockPositionListeners=function(e){e.addEventListener("click",n),e.addEventListener("mousedown",i),e.addEventListener("mouseup",s),console.info("Position Listeners added on block ",e.dataset.blockId)},e.blocks.delBlockPositionListeners=function(e){e.removeEventListener("click",n),e.removeEventListener("mousedown",i),e.removeEventListener("mouseup",s),console.info("Position Listeners removed on block",e.dataset.blockId)},function(t){for(var o=0,n=t.length;o<n;o++)e.blocks.addBlockPositionListeners(t[o]);e.on("keypress",(function(e){27==e.keyCode&&setCurrentPosition("")}))}(e.getBlocksNodeList()),
//!NOTE requires the editorjs-Undo patch to work
document.addEventListener("changeBlocks",(function(t){t.detail.changed.forEach(t=>{var o=t.blockElement,n=o.dataset.blockId,i=o.innerText?[o.innerText]:o;switch(t.changeType){case"add":console.log("Block ("+n+") added",i),e.blocks.addBlockPositionListeners(o);break;case"remove":console.log("Block ("+n+") removed",i),e.blocks.delBlockPositionListeners(o);break;case"update":default:console.log("Block ("+n+") updated",i)}})}))}initClipboard(e){e.clipboard=new function(){this.blockSelection={start:"?",end:"?"},this.data={},this.clear=function(){return this.data={indexes:[],blocks:[]},this.data},this.clear()}}initBlockStatutPositionPanel(e){window.setCurrentPosition=function(e){document.getElementById("currentPosition").value=e},window.refreshCurrentPosition=function(){var t=e.blocks.getCurrentBlockIndex()+1;console.warn("CURRENT POS",t),setCurrentPosition(t)},window.refreshTotalBlocks=function(){document.getElementById("totalBlocks").value=e.blocks.getBlocksCount()},window.refreshBlocksStatusPanel=function(){refreshCurrentPosition(),refreshTotalBlocks()},this.initScrollToBlock(e)}initCaretManager(e){this.setCaretPosition=function(t,o){!function e(t,o){for(var n of t.childNodes)if(3==n.nodeType){if(n.length>=o){var i=document.createRange(),s=window.getSelection();return i.setStart(n,o),i.collapse(!0),s.removeAllRanges(),s.addRange(i),-1}o-=n.length}else if(-1==(o=e(n,o)))return-1;return o}(e.getBlocksNodeList()[t],o)},this.getSelectionCharacterOffsetWithin=function(e){var t,o=0,n=0,i=e.ownerDocument||e.document,s=i.defaultView||i.parentWindow;if(void 0!==s.getSelection){if((t=s.getSelection()).rangeCount>0){var r=s.getSelection().getRangeAt(0),l=r.cloneRange();l.selectNodeContents(e),l.setEnd(r.startContainer,r.startOffset),o=l.toString().length,l.setEnd(r.endContainer,r.endOffset),n=l.toString().length}}else if((t=i.selection)&&"Control"!=t.type){var c=t.createRange(),a=i.body.createTextRange();a.moveToElementText(e),a.setEndPoint("EndToStart",c),o=a.text.length,a.setEndPoint("EndToEnd",c),n=a.text.length}return{in:o,out:n}},this.inlineInjector=function(e){var t,o;window.getSelection&&(t=window.getSelection()).rangeCount?((o=t.getRangeAt(0)).collapse(!0),o.insertNode(e),o.setStartAfter(e),o.collapse(!0),t.removeAllRanges(),t.addRange(o),console.log("Block now injected inline")):alert("Specify first a position with the caret by clicking inside a block")}}init(e){this.editor=e,this.initClipboard(e),this.initGetBlockNodeList(e),this.initBlockStatutPositionPanel(e),this.initBlocksPositionListeners(e),this.initCaretManager(e),console.info("Block plugin initialized")}}window.Block=new BlockPlugin,SoSIE.register("Block");