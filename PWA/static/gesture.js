let canvas = document.querySelector('.row');

// Store touch positions
var touch1, touch2;
// Add event listeners for touch events
canvas.addEventListener("pointerdown", function (e) {
  if (e.pointerType === "touch") {
    // Store the first touch position
    touch1 = { x: e.clientX, y: e.clientY };
  }
});

canvas.addEventListener("pointermove", function (e) {
  if (e.pointerType === "touch" && touch1 && touch2) {
    // Calculate the distance between the two touches
    var dist = Math.sqrt(
      Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
    );

    // Calculate the new zoom level
    var newZoomLevel = zoomLevel * (dist / e.distance);

    // Set the new zoom level
    diagram.setZoomLevel(newZoomLevel);
  }
});

canvas.addEventListener("pointerup", function (e) {
  if (e.pointerType === "touch") {
    // Reset the touch positions
    touch1 = touch2 = null;
    // Update the zoom level
    zoomLevel = diagram.getZoomFactor();
  }
});