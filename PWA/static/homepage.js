var Diagram = MindFusion.Diagramming.Diagram;
var DiagramLink = MindFusion.Diagramming.DiagramLink;
var ControlNode = MindFusion.Diagramming.ControlNode;

var Rect = MindFusion.Drawing.Rect;
var Point = MindFusion.Drawing.Point;

var Animation = MindFusion.Animations.Animation;
var AnimationType = MindFusion.Animations.AnimationType;
var EasingType = MindFusion.Animations.EasingType;
var AnimationEvents = MindFusion.Animations.Events;
var str = [];
var str_hyphens = [];
var n;
var obj;
let stack = [];
var arr = [];
var zero = [];
var vec;
var bx = 50, by = 40;
var diagram = null;
let textArea = "";
DecisionTree = new Tree();


// var input1 = document.querySelector('input');
// var textarea = document.querySelector('textarea');
// let chooseTopic = document.getElementsByClassName('chooseTopic');
let attach = document.querySelector('#file_attach');
// This for loop gets the text input from the links provided by the radio choice button
attach.addEventListener('change', () => {
	let files = attach.files;
	if (files.length == 0) return;

	const file = files[0];
	let reader = new FileReader();
	textArea = [];
	reader.onload = (e) => {
		const file = e.target.result;
		const lines = file.split(/\r\n|\n/);
		textArea.push(lines.join('\n'));
		cleanCanvas();
		input();
	};
	reader.onerror = (e) => Toast(e.target.error.name);
	reader.readAsText(file);
});

window.addEventListener('DOMContentLoaded', ()=>{
	const node = document.querySelector('#firstElement');
	loadTree(node);
})

function cleanCanvas(){
	const canvas = document.getElementById('diagram');
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, ctx.width, ctx.height);
	const previous_nodes = document.querySelectorAll(".mf_diagram_controlNodeContent");

	previous_nodes.forEach(node=>{
		node.remove();
	})
}

function loadTree(element){
	const fileName = element.textContent;
	localStorage.setItem('fname', fileName.trim());

	const URL = element.getAttribute('data-url');
	$.get(URL, function( data ) {
		textArea = data;
		cleanCanvas();
		input();
	});
}

// This function converts the text input to a general tree 
// It also has a debugger, and it will alert the user if any bugs exist
// It is called when users click the submit button
// Input: text input in the textarea
// Output: str is the list containing the the text input line by line without hyphens.
// str-hyphens is the list containing the text input line by line with hyphens.
// arr is the 2d array represents a general tree where index is parent id and values are children id
// set ifSearch to 'no' so that the next page will only show the root node
function input() {
	// check if the textarea is empty or not
	if(textArea.length <= 0) {	
		// TODO: alert the user to choose topic before continuing
		return false;
	}

	textArea = (typeof(textArea)=='string') ? textArea : textArea[0];
	str = textArea.split("\n"); //we will delete the hyphens later
	str_hyphens = textArea.split("\n"); 	
	
	if(str[0].includes("CART")) {
		str = cart(str);
		str_hyphens = str;
	}

	n = str.length;

	// ///console.log("test str in hos: " + str);
	// ///console.log("test str_hyphens in hos: " + str_hyphens);
	vec = new Array(n);
	obj = new Array(n);
	for (var i = 0; i < obj.length; i++) {
		obj[i] = new Array(4);
		arr[i] = new Array(0);
	}

	// ///console.log(n);

	let p = 3;
	let error = "";
	let error_loc = 0;
	// ///console.log(str[1]);
	for (var i = 0; i < n; i++) {
		let size = 0;

		// count the number of hyphens of this line
		for (var j = 0; j < str[i].length; j++) {
			if (str[i][j] != '-') break;
			else size++;
		}

		// count the number of hyphens of the next line
		let next_size = 0;
		if (i != n - 1) {
			///console.log("debugg i + 1: " + (i + 1));
			for (var j = 0; j < str[i + 1].length; j++) {
				if (str[i + 1][j] != '-') break;
				else next_size++;
			}
		}

		// ///console.log(size);
		vec[size / 2] = i;
		if (size == 0) {
			p++;
			// arr[0].push(i);
			zero.push(i);
		}
		else {
			// debugger
			if(i == 0 && size != 0) {
				error = error + "The first line should not have hyphens. You might miss the first line or have extra hyphens for the first line. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			if(str[0].indexOf('?') == -1) {
				error = error + "The first line miss a question mark. \n";
				error_loc = i;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			if(i == 1 && size != 2) {
				error = error + "The second line should have exact two hyphens. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			// if(i + 1 < n && str[i + 1] == '') {
			// 	error = error + "There is an empty line. \n";
			// 	error_loc = i + 2;
			// 	error = error + "The error comes from the line " + error_loc + ". ";
			// 	break;
			// }

			if (size%2 != 0 ) {
				error = error + "There are odd numbers of hyphens. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			// Check the number of hyphens in the next line so that this kind of error has higher priority than the "no answer". 
			if (next_size%2 != 0 ) {
				error = error + "There are odd numbers of hyphens. \n";
				error_loc = i + 2;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}
			
			//if(i + 1 < str.length && str[i + 1] != '') {
			if (str[i][str[i].length - 1] == '?' && size + 2 != next_size) {
				error = error + "Have a question but no answer or further question in the next line. \n";
				error_loc = i + 1;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}			
			else if (str[i][str[i].length - 1] != '?' && size < next_size) {
				error = error + "No question but has answers in this line (maybe a question mark is missing in the last line). \n";
				error_loc = i + 2;
				error = error + "The error comes from the line " + error_loc + ". ";
				break;
			}

			arr[vec[(size / 2) - 1]].push(i);
		}
		// ///console.log(size);
		let len = str[i].length;
		// let s = str[i].search(',');

		// get rid of the hyphens in str array
		str[i] = str[i].substring(size);

		obj[size / 2].push(str[i]);
	}


	// debugger: check if there are same options/answers
	for(let i = 0; i < arr.length; i++) {
		let childList = [];
		if(arr[i].length != 0) {
			for(let j = 0; j < arr[i].length; j++) {
				if(str[arr[i][j]] != undefined) {
					childList.push(str[arr[i][j]]);
				}
				///console.log("check str[arr[i][j]]: " + str[arr[i][j]]);
			}
		}
		
		if(childList.length !== new Set(childList).size) {
			error = error + "This question has multiple children with the same answers below. \n";
			error_loc = i + 1;
			error = error + "The error comes from the line " + error_loc + ". ";
			break;
		}
	}


	localStorage.setItem("str-array", JSON.stringify(str));
	localStorage.setItem("str-hyphens-array", JSON.stringify(str_hyphens));
	localStorage.setItem("arr-array", JSON.stringify(arr));
	//localStorage.setItem("error", JSON.stringify(error));
	localStorage.setItem("ifSearch", JSON.stringify('no'));
	//document.location.href = "tree.html";
	if(error == '') {
		DecisionTree.render();
	}
	else {
		// jump(error_loc);
		Toast("INPUT ERROR: " + error);
	}

}


// When the input has the keyword 'CART' in the first line, the function will parse the format of the CART text output from sciki-learn 
// into valid hyphens format
// It is called by 'input' function which is called when users click the submit button
// Input: the CART text output from sciki-learn
// Ouput: the input of the system with valid hyphens format
// Bug: The hyphens will be missing when printing out the path after searching
function cart(cart_str) {
	
	let new_str = [];
	let rightparen = cart_str[1].indexOf(')');
	new_str.push(cart_str[1].substring(5, rightparen + 1) + "?"); 
	
	for(let i = 1 ; i + 1 < cart_str.length; i++) {

		// Count size before the first letter
		let size = 0; 
		for (let j = 0; j < str[i].length; j++) {
			if (cart_str[i][j] != '|' && cart_str[i][j] != '-' && cart_str[i][j] != ' ') break;
			else size++;
		}

		let vertical_bar = 0;
		for (let j = 0; j < str[i].length; j++) {
			if (cart_str[i][j] == '|') {
				vertical_bar++;
			};
		}

		let hyphens = '';
		for(let j = 0; j < vertical_bar; j++) {
			hyphens += '--';
		}
		
		let new_line = hyphens + 'if ' + cart_str[i].substring(size, cart_str[i].length) + ', ';

		let next_size = 0; 
		for (let j = 0; j < str[i + 1].length; j++) {
			if (cart_str[i + 1][j] != '|' && cart_str[i + 1][j] != '-' && cart_str[i + 1][j] != ' ') break;
			else next_size++;
		}

		///console.log("check size: " + size);
		if(cart_str[i + 1].includes("class")) {
			new_line = new_line + cart_str[i + 1].substring(next_size, cart_str[i + 1].length);
			i += 1;
		}
		else {
			let rightparen2 = cart_str[i + 1].indexOf(')');
			new_line = new_line + cart_str[i + 1].substring(next_size, rightparen2 + 1) + '?';
		}
		
		new_str.push(new_line);

	}

	for(let i = 0; i < new_str.length; i++) {
		///console.log("check new_str: " + new_str[i]);
	}
	
	return new_str;
}
