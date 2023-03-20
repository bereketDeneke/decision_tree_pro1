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

const canvas_container = document.querySelector('.row');
let Rectangle = MindFusion.Drawing.Rect;
let rect = null;
let d1 = 1, rs = 1, rf = 0;

 function dist(a) {
    var zw = a.touches[0].pageX - a.touches[1].pageX, zh = a.touches[0].pageY - a.touches[1].pageY;
    return Math.sqrt(zw * zw + zh * zh);
  }

  canvas_container.addEventListener('touchstart', function(event) {
    event.preventDefault();
    if (event.touches.length > 1) {
      d1 = dist(event);
      
    }
  });
  
  canvas_container.addEventListener('touchmove', function(event) {
    event.preventDefault();
    if (event.touches.length > 1) {

      //get the ratio
      rf = dist(event) / d1 * rs;
      alert(rf," ", d1," ", rs);
      with(Math){
        // console.log('pt: ', rect);
        map = min(max(1, rf), 200);
        diagram.setZoomLevel(map);
        // diagram.zoomToRect(rect);
        rf = map;
      }
    }
  });

  //check if scale is less than 1 and keep the previous ratio
  canvas_container.addEventListener('touchend', function(e) {
    e.preventDefault();
    rs = (rf < 1)? 1: rf;
  });

  canvas_container.addEventListener('touchcancel', function(e){
    e.preventDefault();
    rs = (rf < 1)? 1: rf;
  });


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