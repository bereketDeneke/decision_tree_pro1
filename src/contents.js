import React from "react";
import { MarkerType } from "reactflow";

export const nodes = [
  {
    id: "1",
    type: "customN",
    data: {
      label: <>How many bedrooms you need?; One,Two,Three</>,
      idx: "1",
    },
    position: { x: 250, y: 0 },
    style: {
      background: "#e6d5d5",
      color: "#333",
      border: "1px solid #222138",
      borderRadius: "4px",
      width: 180
    }
  },
  {
    id: "2",
    type:"customN",
    data: {
      label: <>if one, how many square feet?;between 1500 to 3000, more than 3000</>,
      idx: "2",
    },
    position: { x: 100, y: 100 },
    style: {
      background: "#D6D5E6",
      color: "#333",
      border: "1px solid #222138",
      borderRadius: "4px",
      width: 180
    }
  },
  {
    id: "3",
    type:"customN",
    data: {
      label: <>if two, how many square feet?</>,
      idx: "3",
    },
    position: { x: 400, y: 100 },
    style: {
      background: "#fff",
      color: "#333",
      border: "1px solid #222138",
      width: 180
    }
  },
  {
    id: "4",
    type:"output",
    position: { x: 250, y: 200 },
    data: {
      label: "if three, how many square feet?",
      idx: "4",
    }
  },
  {
    id: "5",
    type: "output",
    data: {
      label: <>do you want a swimming pool?</>,
      idx: "5",
    },
    position: { x: 100, y: 280 }
  }
];

export const edges = [
  { id: "e1-2", source: "1", target: "2", markerEnd: {type: MarkerType.ArrowClosed} },
  { id: "e1-3", source: "1", target: "3", markerEnd: {type: MarkerType.ArrowClosed} },
  { id: "e1-4", source: "1", target: "4",  markerEnd: {type: MarkerType.ArrowClosed} },
  {
    id: "e4-5",
    source: "2",
    target: "5",
    // animated: true ,
    // label: "between 1500 to 3000",
    markerEnd: {
      type: MarkerType.ArrowClosed
    }
  }
];
