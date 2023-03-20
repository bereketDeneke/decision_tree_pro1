let jump = 15

function zoomIn(ele){
  try{
    let CurrentZoom = diagram.getZoomFactor();
    if(CurrentZoom > 200 - jump){
      ele.classList.add('deactivate');
    }else{
      CurrentZoom += jump;
      diagram.setZoomLevel(CurrentZoom);
      ele.classList.remove('deactivate');
      document.querySelector('.deactivate').classList.remove('deactivate');
    }
  }catch(e){
    //passs
  }
}

function zoomOut(ele){
  try{
    let CurrentZoom = diagram.getZoomFactor();
    if(CurrentZoom < jump * 2){
      ele.classList.add('deactivate');
    }else{
      CurrentZoom -= jump;
      diagram.setZoomLevel(CurrentZoom);
      ele.classList.remove('deactivate');
      document.querySelector('.deactivate').classList.remove('deactivate');
    }
  }catch(e){
    //passs
  }
}
// Function to prevent pinch and mouse scroll event
function preventScaling(event) {
  if (event.ctrlKey === true || event.metaKey) {
    event.preventDefault();
  }
}

// Attach the preventScaling function to the "wheel" event on the window
window.addEventListener('wheel', preventScaling, { passive: false });

// Attach the preventScaling function to the "touchmove" event on the document
document.addEventListener('touchmove', preventScaling, { passive: false });