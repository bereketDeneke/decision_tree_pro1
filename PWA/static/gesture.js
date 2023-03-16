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