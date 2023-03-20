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
  // newRect = new RectangleF(mousePos.X- visible.Size.Width / 2, mousePos.Y - visible.Size.Height / 2, mousePos.X + visible.Size.Width / 2, mousePos.Y + visible.Size.Height / 2);
  // if (e.Delta > 0)
  // {
  //    newRect.Inflate(1.5f, 1.5f);
  // }
  // else
  // {
  //    newRect.Inflate(-1.5f, -1.5f);
  // }
  //attach the events
  canvas_container.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
      d1 = dist(event);
      
    }
  });
  canvas_container.addEventListener('touchmove', function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();

      //get the ratio
      rf = dist(event) / d1 * rs;
      // X = event.touches[0].pageX + event.touches[1].pageX;
      // X /= 2;
      // Y = event.touches[0].pageY + event.touches[1].pageY;
      // Y /= 2;

      // let visible_w = diagram._element.parentNode.clientWidth;
      // let visible_h = diagram._element.parentNode.clientHeight;

      // rect = new Rectangle(X - visible_w/ 2, Y - visible_h/ 2, X + visible_w / 2, Y + visible_h / 2);
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
  canvas_container.addEventListener('touchend', function() {
    rs = (rf < 1)? 1: rf;
  });

  canvas_container.addEventListener('touchcancel', function(e){
    rs = (rf < 1)? 1: rf;
  });
