'use strict';
class Tree{
    constructor(){
        this.str = JSON.parse(localStorage.getItem("str-array"));
        this.str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array"));
        this.arr = JSON.parse(localStorage.getItem("arr-array"));
        // The key is an id (a single line number starting from 0)
        this.key = JSON.parse(localStorage.getItem("search_result"));
        // this.ifSubtree = JSON.parse(localStorage.getItem("ifSubtree"));

        // ifSearch will become yes only after the user first search the node 
        // This can prevent the tree.html from auto-selecting the answers even though the user just left the index page. 
        this.ifSearch = JSON.parse(localStorage.getItem("ifSearch"));

        // this.error = JSON.parse(localStorage.getItem("error"));
        this.Diagram = MindFusion.Diagramming.Diagram;
        this.DiagramView = MindFusion.Diagramming.DiagramView;
        this.DiagramLink = MindFusion.Diagramming.DiagramLink;
        this.TreeLayout =  MindFusion.Graphs.TreeLayout;
        this.ControlNode = MindFusion.Diagramming.ControlNode;

        this.Rect = MindFusion.Drawing.Rect;
        this.Point = MindFusion.Drawing.Point;

        this.Animation = MindFusion.Animations.Animation;
        this.AnimationType = MindFusion.Animations.AnimationType;
        this.EasingType = MindFusion.Animations.EasingType;
        this.Behavior = MindFusion.Diagramming.Behavior;
        this.AnimationEvents = MindFusion.Animations.Events;
        this.MouseWheelAction = MindFusion.Diagramming.MouseWheelAction;
        
        this.diagram, this.diagramView;
        // The bx and by control the size of the box.
        this.bx = 87, this.by = 30;

        this.currId = 0;
        this.currOriginNode = null;
        
        this.ifNewInput = '';
        this.ifClickedRadio = false;
        
        this.root_key_id = [];
        this.path_subtree = []; 
        this.pathAndSubtree = [];
        this.currTreeIdList = [];
        this.index = 2; // for auto selecting the answers according to path, it is used in the next option function
        
        // set root
        this.root_id = 0;
        this.path_search = [];

        // MindFusion.Diagramming.CompatConfig.propFunctions = true;
        MindFusion.Diagramming.DiagramView.prototype.setZoomFactor =
            function(value) { this.zoomFactor = value; }

        // Event handlers for virtual scrolling
        let isTouching = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let lastUpdateTime = 0;

        window.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                isTouching = true;
                touchStartX = e.touches[0].pageX;
                touchStartY = e.touches[0].pageY;
            }
        });

        window.addEventListener("touchmove", (e) => {
            if (isTouching && e.touches.length === 1) {
                const touchEndX = e.touches[0].pageX;
                const touchEndY = e.touches[0].pageY;
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                // Update the scrolling position
                const now = performance.now();
                if (now - lastUpdateTime > 16) { // Limit updates to 60fps
                    DecisionTree.diagramView.scrollX -= dx;
                    DecisionTree.diagramView.scrollY -= dy;
                    lastUpdateTime = now;
                }
                
                // Prevent scrolling the page
                e.preventDefault();
            }
        });

        window.addEventListener("touchend", () => {
            isTouching = false;
        });

    }

    __init__(){
        this.cleanCanvas();
        this.str = JSON.parse(localStorage.getItem("str-array"));
        this.str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array"));
        this.arr = JSON.parse(localStorage.getItem("arr-array"));
        // The key is an id (a single line number starting from 0)
        this.key = JSON.parse(localStorage.getItem("search_result"));
        // this.ifSubtree = JSON.parse(localStorage.getItem("ifSubtree"));

        // ifSearch will become yes only after the user first search the node 
        // This can prevent the tree.html from auto-selecting the answers even though the user just left the index page. 
        this.ifSearch = JSON.parse(localStorage.getItem("ifSearch"));

        if(this.ifSearch == 'yes' ) {
            this.ifNewInput = 'no';
        }
        else if(this.ifSearch == 'no') {
            this.ifNewInput = 'yes';
        }
    }

    cleanCanvas(){
        const canvas = document.getElementById('diagram');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.width, ctx.height);
        const previous_nodes = document.querySelectorAll(".mf_diagram_controlNodeContent");
    
        previous_nodes.forEach(node=>{
            node.remove();
        })
    }

    render(){
        this.__init__();
        // Render Root 
        this.currTreeIdList.push(0);
        this.diagramView = this.DiagramView.create(document.getElementById("diagram"));
        this.diagram = this.diagramView.diagram;
        this.diagram.addEventListener("nodeActivated", function (sender, e) {
            if (e.node !== this.diagram.selection.items[0]) {
                this.diagram.activeItem = this.diagram.selection.items[0];
                bounds = activeItem.getBounds();

                const bounds = this.diagram.activeItem.bounds;
                // Center the diagram on the active item or node
                const centerX = bounds.x + bounds.width / 2;
                const centerY = bounds.y + bounds.height / 2;
                this.diagramView.scrollTo(centerX - diagram.clientWidth / 2, centerY - diagram.clientHeight / 2);
            }
        });
        
        this.diagramView.behavior = this.Behavior.DoNothing;
        this.diagramView.multiTouchDraw = false;
        this.diagramView.multiTouchZoom = true;
        this.diagramView.mouseWheelAction = this.MouseWheelAction.Zoom;
        this.diagram.virtualScroll = true;

        let id = 0;
        let node = new this.ControlNode(this.diagramView);
        let len = this.str[id].search(',');
        let s = this.str[0].substring(len + 1, this.str[0].length);


        // detect if the text contains link and add hypertext reference to the link
        // WE WANT TO BE ABLE TO POPULATE TREE NOT LINK EXTERNAL TREE
        let s_len = s.search("https");
        let link = s.substring(s_len, s.length);
        if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
            let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
            s = s.substring(0, s_len) + link_ref;
        }

        // Shrink the node if the text is small. 
        if(s.length < 40) {
            this.by = 22;
        }
        else {
            this.by = 30;
        }

        let {val, ifCheckbox, unique_id} = decision_node(this.arr, id, s, false, true);
        node.template = val;
        node.bounds = new Rect(40, 10, this.bx, this.by);
        node.id = id;
        this.diagram.addItem(node);
        this.diagram.resizeToFitItems(10);

        // printing and saving the path from root to keyword node
        if(this.ifSearch == 'yes') {
            this.findPath(0, this.root_key_id, this.key);
            let root_key = [];
            for(let i = 0; i < this.root_key_id.length; i++) {
                root_key.push(this.str_hyphens[this.root_key_id[i]]);
                this.pathAndSubtree.push(this.root_key_id[i]);
            }

    
            //console.log("search path (from root to keyword): ");
            for(let i = 0; i < root_key.length; i++) {
                //console.log(root_key[i] + '\n');
            }
            
            // for passing values to python
            let root_key_dic = Object.assign({}, root_key);
            const s_test = JSON.stringify(root_key_dic);
            $.ajax({
                url:"/root_to_keyword",
                type:"POST",
                contentType:"application/json",
                data: JSON.stringify(s_test),
            });
            //console.log("subtree: ");

            // get subtree
            this.subtree(true, this.key); // this function will fill up the path_subtree

            let path_subtree_dic = Object.assign({}, this.path_subtree );
            const s2 = JSON.stringify(path_subtree_dic);
            $.ajax({
                url:"/get_subtree",
                type:"POST",
                contentType:"application/json",
                data: JSON.stringify(s2),
            });


            $('.select').val(this.root_key_id[1]);
            this.selectClick(0, node);
    
                
                // create new node for the new input file
                // //console.log("check s: " + s);
        }
            
        if(s.includes("DECISIONTREE") && this.ifNewInput == 'yes') {
                this.newInput(link, id);
        }
    }

    nextoption(id, originNode){
        this.currTreeIdList.push(parseInt(id));
        let ifCheckbox_1 = false;
        let node = new this.ControlNode(this.diagramView);
        let len = this.str[id].search(',');
        let s = this.str[id].substring(len + 1, this.str[id].length);

        // detect if the text contains link and add hypertext reference to the link
        let s_len = s.search("https");
        let link = s.substring(s_len, s.length);
        if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
            let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
            s = s.substring(0, s_len) + link_ref;
        }

        // Shrink the node if the text is small. 
        if(s.length < 40) {
            this.by = 22;
        }
        else {
            this.by = 30;
        }

        // detect and handle sql query
        if(s.includes("SQL")) {
            // We need this myCallback function because the code in ajax runs asynchronously. 
            // We use this function to help receive the result from python
            function myCallback(sql_result) {

                //console.log("check sql_result[1]: "  + sql_result[1]);
                
                let sql_result_list = [];
                let hasResult = true;
                while(sql_result[1].length > 9) { // > 9 because we have \n <\div> in the end
                    let len3 = sql_result[1].indexOf("("); // the data is in data[1] instead of data[0] for some reason
                    let len4 = sql_result[1].indexOf(")");
                    if(len3 == -1 || len4 == -1) {
                        hasResult = false;
                        break; // that means there is no result
                    }
                    let test = sql_result[1].substring(len3 + 1, len4).split(', ');
                    //console.log("test: " + test);
                    sql_result_list.push(test);
                    sql_result[1] = sql_result[1].substring(len4 + 1, sql_result[1].length);
                    //console.log("check sql_result for each loop: " + sql_result[1]);
                }

                if(hasResult == true) {
                    //console.log("check sql_result_list: " + sql_result_list[0]);
                    let ifPlural1 = sql_result_list.length > 1 ? "houses " : "house ";
                    let ifPlural2 =  sql_result_list.length > 1 ? "meet " : "meets ";
                    let ifPlural3 =  sql_result_list.length > 1 ? "are " : "is ";
                    s = "The " + ifPlural1 + ifPlural2 +  "your need " + ifPlural3 + ": " + sql_result_list[0][1];
                    for(let i = 1; i < sql_result_list.length; i++) {
                        s = s + ', ' + sql_result_list[i][1];
                    }
                }
                else if(this.ifSearch != 'yes'){ 
                    // If there is no result
                    // ifSearch != 'yes' because when users search sql command in the node, the desire answer should not be the string below.
                    // this can be trivial because users usually don't want to search the sql command which will be replaced with more readable string answers. 
                    s = "Sorry, there is no house meeting your need. Please change your answers.";
                }

                //console.log("check s in get_sql_result: " + s);
                //console.log("check id in nextoption: " + id);

                let {val, ifCheckbox, unique_id} = decision_node(this.arr, id, s, false, true);
                node.template = val;
                node.bounds = new Rect(originNode.bounds.x, originNode.bounds.y + 60, this.bx, this.by);
                node.id = id;
                node.locked = true;
                node.visible = true; // I changed it from false to true for auto selecting the answers according to path
                
                this.diagram.addItem(node);
                this.diagram.resizeToFitItems(10);
                
                this.diagram.addItem(node);
                this.createAnimatedLink(originNode, node);
                this.diagram.resizeToFitItems(10);
            }
            
            get_sql_result(myCallback);

            function get_sql_result(callback) { 
                let len2 = s.search('SQL:');
                let query = s.substring(len2 + 5, s.length); // plus 5 to skip 'SQL: ' 
                //console.log(query);
                let query_list = [];
                query_list.push(query);
                let query_dic = Object.assign({}, query_list);
                const s2 = JSON.stringify(query_dic);
                $.ajax({
                    url:"/get_sql",
                    type:"POST",
                    contentType:"application/json",
                    data: JSON.stringify(s2),
                    success: callback,
                });
            }

        } else {
            let {val, ifCheckbox, unique_id} = decision_node(this.arr, id, s, false, true);
            node.template = val;
            node.bounds = new Rect(originNode.bounds.x, originNode.bounds.y + 60, this.bx, this.by);
            node.id = id; 
            node.locked = true;
            node.visible = true; // I changed it from false to true for auto selecting the answers according to path
            
            this.diagram.addItem(node);
            this.createAnimatedLink(originNode, node);
            this.diagram.resizeToFitItems(10);
            
            // submit the checkbox answers
            if(this.arr[id].length > 5) {
                let o = document.getElementById("cb-button");
                //console.log("check o: " + o);
                this.currId = id;
                this.currOriginNode = node;
                o.onclick = this.checkboxAnswers;
            }

            //auto select along the path
            if(this.arr[id].length !=  0 && this.ifSearch == 'yes' && this.index < this.root_key_id.length) {
                let id_str = id.toString();
                $('#' + id_str).val(this.root_key_id[this.index]);
                this.index = this.index + 1;
                if(ifCheckbox == false) {
                    // 0 has no meaning. It is just the 'e' standing for everything
                    this.selectClick(0, node);
                }
                else if(ifCheckbox == true) {
                    let results = [];
                    results.push(this.root_key_id[this.index - 1] - parseInt(id) - 1);
                    this.showCheckbox(id, node, results);
                }
            }

            // create a larger decision tree for the new input file
            if(s.includes("DECISIONTREE") && this.ifNewInput == 'yes') {
                this.newInput(link, id, false, 0);
                this.ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
            }
        }
    }

    notSure(id, originNode){
        let node = new this.ControlNode(this.diagramView);
        let layout = new this.TreeLayout();
        
        // Properties
        layout.root = node;
        layout.direction = MindFusion.Graphs.LayoutDirection.TopToBottom;
        layout.keepRootPosition = true;
        layout.levelDistance = 33;
        // let linkType = MindFusion.Graphs.TreeLayoutLinkType.Cascading;
        
        if (this.arr[id].length > 0) {
            for (let i = 0; i < this.arr[id].length; i++) {
                let node = new this.ControlNode(this.diagramView);
                let ids = this.arr[id][i];
                this.currTreeIdList.push(parseInt(ids));
                let len = this.str[ids].search(',');
                let s = this.str[ids].substring(len + 1, this.str[ids].length);
                //console.log("check ids1: " + ids);
                // Shrink the node if the text is small. 
                if(s.length < 40) {
                    this.by = 22;
                }
                else {
                    this.by = 30;
                }


                // detect if the text contains link and add hypertext reference to the link
                let s_len = s.search("https");
                let dtlink = s.substring(s_len, s.length);
                if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
                    let link_ref = '<a href="' + dtlink + '" target="_blank">' + dtlink + '</a>';
                    s = s.substring(0, s_len) + link_ref;
                }

                
                // detect and handle sql query
                if(s.includes("SQL")) {
                    // We need this myCallback function because the code in ajax runs asynchronously. 
                    // We use this function to help receive the result from python
                    function myCallback(sql_result) {
                        //console.log("check sql_result[1]: "  + sql_result[1]);

                        let sql_result_list = [];
                        let hasResult = true;
                        while(sql_result[1].length > 9) { // > 9 because we have \n <\div> in the end
                            let len3 = sql_result[1].indexOf("("); // the data is in data[1] instead of data[0] for some reason
                            let len4 = sql_result[1].indexOf(")");
                            if(len3 == -1 || len4 == -1) {
                                hasResult = false;
                                break; // that means there is no result
                            }
                            let test = sql_result[1].substring(len3 + 1, len4).split(', ');
                            //console.log("test: " + test);
                            sql_result_list.push(test);
                            sql_result[1] = sql_result[1].substring(len4 + 1, sql_result[1].length);
                            //console.log("check sql_result for each loop: " + sql_result[1]);
                        }

                        if(hasResult == true) {
                            //console.log("check sql_result_list: " + sql_result_list[0]);
                            let ifPlural1 = sql_result_list.length > 1 ? "houses " : "house ";
                            let ifPlural2 =  sql_result_list.length > 1 ? "meet " : "meets ";
                            let ifPlural3 =  sql_result_list.length > 1 ? "are " : "is ";
                            s = "The " + ifPlural1 + ifPlural2 +  "your need " + ifPlural3 + ": " + sql_result_list[0][1];
                            for(let i = 1; i < sql_result_list.length; i++) {
                                s = s + ', ' + sql_result_list[i][1];
                            }
                        }
                        else if(this.ifSearch != 'yes'){ 
                            // If there is no result
                            // ifSearch != 'yes' because when users search sql command in the node, the desire answer should not be the string below.
                            // this can be trivial because users usually don't want to search the sql command which will be replaced with more readable string answers. 
                            s = "Sorry, there is no house meeting your need. Please change your answers.";
                        }

                        //console.log("check s in get_sql_result: " + s);
                        let showResult = this.str[ids].substring(0, len + 2) + s;
                        
                        let {val, ifCheckbox, unique_id} = decision_node(this.arr, ids, showResult);
                        node.template = val;
                        node.bounds = new Rect(originNode.bounds.x, originNode.bounds.y + 60, this.bx, this.by);
                        node.id = ids;

                        node.stroke = '#003466';
                        this.diagram.addItem(node);
                        let link = new DiagramLink(this.diagram, originNode, node);
                        link.headShape = 'Triangle';
                        link.headBrush = '#003466';
                        link.stroke = '#003466';
                        link.locked = true;

                        this.diagram.addItem(link);
                        this.diagram.arrange(layout);
                        this.diagram.resizeToFitItems(10);
                    }

                    get_sql_result(myCallback);

                    function get_sql_result(callback) { 
                        let len2 = s.search('SQL:');
                        let query = s.substring(len2 + 5, s.length); // plus 5 to skip 'SQL: ' 
                        
                        //console.log(query);
                        let query_list = [];
                        query_list.push(query);

                        let query_dic = Object.assign({}, query_list);
                        const s2 = JSON.stringify(query_dic);
                        
                        $.ajax({
                            url:"/get_sql",
                            type:"POST",
                            contentType:"application/json",
                            data: JSON.stringify(s2),
                            success: callback,
                        });
                    }
            
                }    
                else {            
                    let {val, ifCheckbox, unique_id} = decision_node(this.arr, ids, this.str[ids], true, true);
                    node.template = val;
                    node.bounds = new Rect(originNode.bounds.x, originNode.bounds.y + 60, this.bx, this.by);
                    node.id = ids;
                    // node.setLocked(true);
                    // node.setVisible(false);
                    node.stroke  = '#003466';
                    this.diagram.addItem(node);

                    let link = new DiagramLink(this.diagram, originNode, node);
                    link.headShape = 'Triangle';
                    link.headBrush = '#003466';
                    link.stroke = '#003466';
                    link.locked = true;

                    this.diagram.addItem(link);
                    this.diagram.arrange(layout);
                    this.diagram.resizeToFitItems(10);
                    // createAnimatedLink(originNode, node);
                    
                    // submit the checkbox answers
                    if(this.arr[id].length > 5) {
                        let o = document.getElementById("cb-button");
                        //console.log("check o: " + o);
                        this.currId = id;
                        this.currOriginNode = node;
                        o.onclick = checkboxAnswers;
                    }

                    // create a larger decision tree for the new input file
                    if(s.includes("DECISIONTREE") && this.ifNewInput == 'yes') {
                        //console.log("reach decisiontree");
                        this.newInput(dtlink, id, true, i);
                        this.ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
                    }
                }
            }
        }
    }

    selectClick(e, sender){
        let selectControl = sender.content.getElementsByTagName("select")[0];
        this.deleteNode(sender.id);
        
        if (selectControl.value != "none" && selectControl.value != "NotSure") {
            if(this.str[selectControl.value] != undefined) {
                this.nextoption(selectControl.value, sender); 
            }

            //print path from root to current node
            let parent = this.str[sender.id];
            let parent_id = sender.id;
            let child = this.str[selectControl.value];
            let child_id = selectControl.value;
            if(this.ifSearch == 'no') {
                this.printPath(parent_id, child_id, true);
            }
            
        }else if (selectControl.value == "NotSure") {
            this.notSure(sender.id, sender);
            //print path
            let parent = this.str[sender.id];
            let parent_id = sender.id;
            this.printPath(parent_id, -1, false);
        }
        
        active_node(sender.content);
    }

    showCheckbox(id, originNode, results){
        let node = new this.ControlNode(this.diagramView);
        let layout = new this.TreeLayout();
    
        layout.root = node;
        layout.direction = MindFusion.Graphs.LayoutDirection.TopToBottom;
        layout.keepRootPosition = true;
        layout.levelDistance = 10;
        // linkType = MindFusion.Graphs.TreeLayoutLinkType.Cascading;

        if (this.arr[id].length > 0) {
            for (let i = 0; i < this.arr[id].length; i++) {
                if(results.includes(i)) {
                    let node = new this.ControlNode(this.diagramView);
                    let ids = this.arr[id][i];
                    this.currTreeIdList.push(parseInt(ids));

                    let len = this.str[ids].search(',');
                    let s = this.str[ids].substring(len + 1, this.str[ids].length);
    
                    // Shrink the node if the text is small. 
                    if(s.length < 40) {
                        this.by = 22;
                    }
                    else {
                        this.by = 30;
                    }
                    
                    // detect if the text contains link and add hypertext reference to the link
                    // rename link to dtlink(decision tree link) here because we use the name 'link' later for arrows
                    let s_len = s.search("https");
                    let dtlink = s.substring(s_len, s.length);
                    if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
                        let link_ref = '<a href="' + dtlink + '" target="_blank">' + dtlink + '</a>';
                        s = s.substring(0, s_len) + link_ref;
                    }
    
                    // detect and handle sql query
                    if(s.includes("SQL")) {
                        // We need this myCallback function because the code in ajax runs asynchronously. 
                        // We use this function to help receive the result from python
                        function myCallback(sql_result) {
                            //console.log("check sql_result[1]: "  + sql_result[1]);
    
                            let sql_result_list = [];
                            let hasResult = true;
                            while(sql_result[1].length > 9) { // > 9 because we have \n <\div> in the end
                                let len3 = sql_result[1].indexOf("("); // the data is in data[1] instead of data[0] for some reason
                                let len4 = sql_result[1].indexOf(")");
                                if(len3 == -1 || len4 == -1) {
                                    hasResult = false;
                                    break; // that means there is no result
                                }
                                let test = sql_result[1].substring(len3 + 1, len4).split(', ');
                                //console.log("test: " + test);
                                sql_result_list.push(test);
                                sql_result[1] = sql_result[1].substring(len4 + 1, sql_result[1].length);
                                //console.log("check sql_result for each loop: " + sql_result[1]);
                            }
    
                            if(hasResult == true) {
                                //console.log("check sql_result_list: " + sql_result_list[0]);
                                let ifPlural1 = sql_result_list.length > 1 ? "houses " : "house ";
                                let ifPlural2 =  sql_result_list.length > 1 ? "meet " : "meets ";
                                let ifPlural3 =  sql_result_list.length > 1 ? "are " : "is ";
                                s = "The " + ifPlural1 + ifPlural2 +  "your need " + ifPlural3 + ": " + sql_result_list[0][1];
                                for(let i = 1; i < sql_result_list.length; i++) {
                                    s = s + ', ' + sql_result_list[i][1];
                                }
                            }
                            else if(this.ifSearch != 'yes'){ 
                                // If there is no result
                                // ifSearch != 'yes' because when users search sql command in the node, the desire answer should not be the string below.
                                // this can be trivial because users usually don't want to search the sql command which will be replaced with more readable string answers. 
                                s = "Sorry, there is no house meeting your need. Please change your answers.";
                            }
    
    
                            //console.log("check s in get_sql_result: " + s);
    
                            // str[ids]
                            // let val = `<div id="d1"><p>` + s + `</p></div>`;
                            let showResult = this.str[ids].substring(0, len + 2) + s;
                            let {val, ifCheckbox, unique_id} = decision_node(this.arr, ids, showResult);
                            node.template = val;
                            node.bounds = new Rect(originNode.bounds.x, originNode.bounds.y + 60, this.bx, this.by);
                            node.id = ids;
                            node.stroke  = '#003466';
                            this.diagram.addItem(node);
    
                            let link = new DiagramLink(this.diagram, originNode, node);
                            link.headShape = 'Triangle';
                            link.headBrush = '#003466';
                            link.stroke = '#003466';
                            link.locked = true;

                            this.diagram.addItem(link);
                            this.diagram.arrange(layout);
                            this.diagram.resizeToFitItems(10);
                        }
    
                        get_sql_result(myCallback);
    
                        function get_sql_result(callback) { 
                            let len2 = s.search('SQL:');
                            let query = s.substring(len2 + 5, s.length); // plus 5 to skip 'SQL: ' 
                            //console.log(query);
                            let query_list = [];
                            query_list.push(query);
                            let query_dic = Object.assign({}, query_list);
                            const s2 = JSON.stringify(query_dic);
                            $.ajax({
                                url:"/get_sql",
                                type:"POST",
                                contentType:"application/json",
                                data: JSON.stringify(s2),
                                success: callback,
                            });
                        }
                    }
                    else {
                        let {val, ifCheckbox, unique_id} = decision_node(this.arr, ids, this.str[ids]);
                        node.template = val;
                        node.bounds = new Rect(originNode.bounds.x, originNode.bounds.y + 60, this.bx, this.by);
                        node.id = ids;
                        // node.setLocked(true);
                        // node.setVisible(false);
                        node.stroke = '#003466';
                        this.diagram.addItem(node);
                        let link = new DiagramLink(this.diagram, originNode, node);
                        link.headShape = 'Triangle';
                        link.headBrush = '#003466';
                        link.stroke = '#003466';
                        link.locked = true;
                        this.diagram.addItem(link);
                        // createAnimatedLink(originNode, node);
                        this.diagram.arrange(layout);
                        this.diagram.resizeToFitItems(10);
    
                        // create a larger decision tree for the new input file
                        if(s.includes("DECISIONTREE") && this.ifNewInput == 'yes') {
                            //console.log("reach decisiontree");
                            this.newInput(dtlink, id, true, i);
                            this.ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
                        }
                    
                    }
                }
            }
        }
    }

    createAnimatedLink(originNode, node){
        let link = new DiagramLink(this.diagram, originNode, node);
        link.headShape = 'Triangle';
        link.headBrush = '#003466';
        link.stroke = '#003466';
        link.locked = true;
        this.diagram.addItem(link);
        
        let ep = link.endPoint;
        link.endPoint = link.startPoint;
        let animation = new Animation(link, { fromValue: link.startPoint, toValue: ep, animationType: AnimationType.Bounce, easingType: EasingType.EaseOut, duration: 1000 }, this.onUpdateLink);
        
        animation.addEventListener(AnimationEvents.animationComplete, function (sender, args) {
            node.visible = true;
        });
        
        animation.start();
    }

    deleteNode(id){
        for(let i = 0; i < this.arr[id].length; i++) {
            let index = this.currTreeIdList.indexOf(this.arr[id][i]);
            if (index > -1) { // only splice array when item is found
              this.currTreeIdList.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    
        let nodes = this.diagram.nodes.filter(function (p) {
            return p.id === id;        
        });
    
        if (nodes.length > 0) {
            this.deleteRecursively(nodes[0].outgoingLinks);
        }
    }

    deleteRecursively(links){
        for (let i = links.length - 1; i >= 0; i--) {
            let node = links[i].destination;
            let nlinks = node.outgoingLinks;
            this.deleteRecursively(nlinks);
            this.diagram.removeItem(node);
        }
    }

    onUpdateLink(animation, animationProgress){
        let link = animation.item;
        let pointA = animation.fromValue,
            pointB = animation.toValue;

        link.endPoint = new Point(
                pointA.x + (pointB.x - pointA.x) * animationProgress,
                pointA.y + (pointB.y - pointA.y) * animationProgress);
        link.invalidate();
    }

    printPath(parent_id, child_id, ifsure){
        let save_path = []
        //console.log("Path(from root to curr): " + this.str_hyphens[parent_id] + "\n");
        save_path.push(this.str_hyphens[parent_id]);

        if(ifsure == true) {
            // we only print the child when the child is the leaf
            if(this.arr[child_id] != undefined && this.arr[child_id].length == 0) {
                //console.log("Path(from root to curr): " + this.str_hyphens[child_id] + "\n");
                save_path.push(this.str_hyphens[child_id]);
            }
        }
        else if(ifsure == false) {
            if(this.arr[parent_id].length != 0) {
                for(let i = 0; i < this.arr[parent_id].length; i++) {
                    //console.log("Path(from root to curr): " + this.str_hyphens[this.arr[parent_id][i]] + "\n");
                    save_path.push(this.str_hyphens[child_id]);
                }
            }
        }

        // for passing values to python
        let save_path_dic = Object.assign({}, save_path);
        const s_test = JSON.stringify(save_path_dic);
        $.ajax({
            url:"/root_to_curr",
            type:"POST",
            contentType:"application/json",
            data: JSON.stringify(s_test)
        });
    }

    findPath(root_id, path, k){
        // base case
        if(root_id == undefined) {
            return false;
        }
        
        path.push(root_id);
        if(root_id == k) {
            return true;
        }

        for(let j = 0; j < this.arr[root_id].length; j++) {
            if(this.arr[root_id].length != 0 && this.findPath(this.arr[root_id][j], path, k)) {
                return true;
            }
        }

        //pop out because the key is not in the subtree of the node
        path.pop();
        return false;
    }

    subtree(ifPrint, node_id){
        if(node_id < this.arr.length && this.arr[node_id].length == 0) {
            return;
        }
        else if(node_id < this.arr.length) {
            for(let j = 0; j < this.arr[node_id].length; j++) {
                if(ifPrint == true) {
                    // print out the subtree
                    //console.log(this.str_hyphens[this.arr[node_id][j]]);
                }
    
                this.path_subtree.push(this.str_hyphens[this.arr[node_id][j]]);
                this.pathAndSubtree.push(this.arr[node_id][j]);
                this.subtree(ifPrint, this.arr[node_id][j]);
                // active_node(arr[node_id][j].content);
            }
        }
    }

    input_search(){
        let keyword = $('#input').val();
        let result = this.keywordSearch(keyword);
        let text = document.querySelector('#result');

        if(result.length == 0) {
            text.classList.remove('show');
            text.classList.add('hide');
            Toast("The box containing this keyword doesn't exist.");
            return;
        }else if(keyword == '') {
            text.classList.remove('show');
            text.classList.add('hide');
            Toast("You did not input any keyword");
            return;
        }else if(result.length == 1) {
            
            text.innerHTML = 'Only one box containing the keyword: <br>';
            text.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font> <br><br>';
            // for checking the first option
            text.innerHTML += this.str[result[0]] + '<input name="search_result" type="radio" value="'+ result[0] +'" checked> <br>';
        }else {
            // text.innerHTML = '<br>Please click "Expand" button to see the result from each group<br><br>' ;
            // text.innerHTML += "<input onclick=" + "DecisionTree.showOrHideResultsX(result)" + " type='button' value='Expand'/>";
            this.showOrHideResultsX(result);
           
            // text.innerHTML = '<div id="alreadyVisited">Boxes in tree so far: </div><br>';
            this.showOrHideResultsY(result);
            // text.innerHTML += "<input onclick=" + "DecisionTree.showOrHideResultsY(result)" + "  type='button' value='Expand'/>";
            // text.innerHTML += '<div id="reachable">Boxes reachable from current tree: </div><br>';
            
            this.pathAndSubtree = []; // empty the pathAndSubtree

            this.showOrHideResultsZ(result);
            // text.innerHTML += "<input onclick=" + "DecisionTree.showOrHideResultsZ(result)" + "  type='button' value='Expand'/>";
            // text.innerHTML += '<div id="otherNodes">Other boxes: </div><br>';
        }
        
        text.classList.remove('hide');
        text.classList.add('show');
    }

    keywordSearch(key){
        let loc = [];
        for(let i = 0; i < this.str_hyphens.length; i++) {
            let str_answer = this.str_hyphens[i].substring(this.str_hyphens[i].search(',') + 2, this.str_hyphens[i].length);
            let result = str_answer.search(key);
            if(result != -1) {
                loc.push(i);
            }
        }

        return loc;
    }

    submit(){
        if(this.atLeastOneRadio() == true) {
            let result = document.getElementsByName('search_result');
            for(let i = 0; i < result.length; i++) {
                if(result[i].checked) {
                    localStorage.setItem("search_result", JSON.stringify(result[i].value));
                }
            }
        
            let ifSubtree = document.getElementsByName('ifSubtree');
            for(let i = 0; i < ifSubtree.length; i++) {
                if(ifSubtree[i].checked) {
                    localStorage.setItem("ifSubtree", JSON.stringify(ifSubtree[i].value));
        
                }
            }
            localStorage.setItem("ifSearch", JSON.stringify('yes'));
            
            // render_tree();
            // window.location.href = "tree.html"; 
        }
        else {
            Toast("Please choose one radio button");
        }
    }

    newInput(link, id, ifCheckbox, addIdForCheckbox){
        let str_hyphens_old = this.str_hyphens;
        // sender.id is not an interger, you must parse it to int. 
        id = parseInt(id);
        $.get( link, function( data) {

            let str_old = [];
            let arr_get = [];
            var str2 = [];
            var n;
            var obj;
            let stack = [];
            // var arr = [];
            var zero = [];
            var vec;
            var text = data;
            if(ifCheckbox == true) {
                id = id + addIdForCheckbox + 1; // plus one because addIdForCheckbox started from zero
            }
            
            let str_hyphens2 = text.split("\n"); 
            str_hyphens2 = str_hyphens2.filter(n => n);

            str_hyphens2[0] = "if show next, " + str_hyphens2[0]; 
            // Add more hyphens to the new input: str_hyphens2
            let more_hyphens = '--';
            for (let j = 0; j < str_hyphens_old[id].length; j++) {
                if (str_hyphens_old[id][j] != '-') break;
                else more_hyphens += '-';
            }

            for(let i = 0; i < str_hyphens2.length; i++) {
                str_hyphens2[i] = more_hyphens.concat(str_hyphens2[i]);
            }

            str_hyphens_old = str_hyphens_old.filter(n => n);

            let left = [];
            let right = [];
            for(let i = 0; i < id + 1; i++) {
                left.push(str_hyphens_old[i]);
            }

            for(let i = id + 1; i < str_hyphens_old.length; i++) {
                right.push(str_hyphens_old[i]);
            }
            
            this.str_hyphens = left.concat(str_hyphens2);
            this.str_hyphens = this.str_hyphens.concat(right);    
            
            
            n = this.str_hyphens.length;

            vec = new Array(n);
            obj = new Array(n);
            for (var i = 0; i < obj.length; i++) {
                obj[i] = new Array(4);
                arr_get[i] = new Array(0);
            }
        
            let error = "";
            for (var i = 0; i < n; i++) {
                let size = 0;
        
                // count the number of hyphens of this line
                for (var j = 0; j < this.str_hyphens[i].length; j++) {
                    if (this.str_hyphens[i][j] != '-') break;
                    else size++;
                }
        
                // count the number of hyphens of the next line
                let next_size = 0;
                if (i != n - 1) {
                    for (var j = 0; j < this.str_hyphens[i + 1].length; j++) {
                        if (this.str_hyphens[i + 1][j] != '-') break;
                        else next_size++;
                    }
                }
        
                vec[size / 2] = i;
                if (size == 0) {
                    zero.push(i);
                }
                else {
                    arr_get[vec[(size / 2) - 1]].push(i);
                }
        
                // get rid of the hyphens in str array
                str_old[i] = this.str_hyphens[i].substring(size);
        
                //ZL: I don't know what the obj is used for as it is never used again thereafter. However, the system will crash if I commented this line 
                obj[size / 2].push(str_old[i]);
            }
            
            localStorage.setItem("str-array", JSON.stringify(str_old));
            localStorage.setItem("str-hyphens-array", JSON.stringify(this.str_hyphens));
            localStorage.setItem("arr-array", JSON.stringify(arr_get));
            localStorage.setItem("ifSearch", JSON.stringify('yes'));
            localStorage.setItem("ifNewInput", JSON.stringify('no'));
            localStorage.setItem("search_result", JSON.stringify(id));
            
            // render_tree();
            // window.location.href = "tree.html";
            
        });
    }

    checkboxAnswers(){
        this.deleteNode(this.currOriginNode.id);
        let results = [];
        let checkbox = document.getElementsByClassName('checkbox');
        for(let i = 0; i < checkbox.length; i++) {
            if(checkbox[i].checked == true) {
                results.push(i);
            }
        }
        this.showCheckbox(this.currId, this.currOriginNode, results);
    }

    checkIfTheContentExists(content){
        return document.getElementById('result').textContent.includes(content);
    }

    showOrHideResultsX(result){
        let x = document.getElementById("alreadyVisited");
        x.classList.remove("remove-result");
        // if(x.textContent === "Boxes in tree so far") {
            x.innerHTML += '<br>';
            // x.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font> <br><br>';
        
            let hasResult = false;
            for(let i = 0; i < result.length; i++) {
                if(this.currTreeIdList.includes(result[i]) && !this.checkIfTheContentExists(this.str[result[i]])) {
                    ////console.log(this.currTreeIdList[i]);
                    x.innerHTML += "<div class='result-card'  onclick=DecisionTree.activateCheckbox(this)><p>"+this.str[result[i]] + '</p><input name="search_result" type="radio" value="'+ result[i] +'"></div> <br> ';
                    hasResult = true;
                }
            }

            if ($('input[name=search_result]:checked').length > 0) {
                ////console.log("reach");
                this.ifClickedRadio = true; 
            }   

            if(hasResult == false) {
                // x.innerHTML += "<div class='result-card'><p>No Result</p></div>";
                x.innerHTML = "";
                x.classList.add('remove-result');
            }
        // }
        // else {
        //     x.innerHTML = "Boxes in tree so far";
        // }
    }

    showOrHideResultsY(result){
        let y = document.getElementById("reachable");
        y.classList.remove("remove-result");
        // if(y.textContent === "Boxes reachable from current tree") {
            y.innerHTML += '<br>';
            // y.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font> <br><br>';
            let hasResult = false;
            this.subtree(false, this.currTreeIdList[this.currTreeIdList.length - 1]);        
            for(let i = 0; i < result.length; i++) {
                if(this.pathAndSubtree.includes(result[i]) && !this.checkIfTheContentExists(this.str[result[i]])) {
                    y.innerHTML += "<div class='result-card'  onclick=DecisionTree.activateCheckbox(this)><p>"+this.str[result[i]] + '</p><input name="search_result" type="radio" value="'+ result[i] +'"></div> <br> ';
                    hasResult = true;
                }
            }

            if ($('input[name=search_result]:checked').length > 0) {
                this.ifClickedRadio = true; 
            }   

            if(hasResult == false) {
                // y.innerHTML += "<div class='result-card'><p>No Result</p></div>";
                y.innerHTML = "";
                y.classList.add('remove-result');
            }
        // }
        // else {
        //     y.innerHTML = "Boxes reachable from current tree";
        // }
    }

    showOrHideResultsZ(result){
        let z = document.getElementById("otherNodes");
        z.classList.remove("remove-result");
        // if(z.textContent === "Other boxes") {
            z.innerHTML += '<br>';
            // z.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font><br><br>';

            let hasResult = false;
            for(let i = 0; i < result.length; i++) {
                if(this.currTreeIdList.includes(result[i]) == false && this.pathAndSubtree.includes(result[i]) == false  && !this.checkIfTheContentExists(this.str[result[i]])) {
                    z.innerHTML += "<div class='result-card' onclick=DecisionTree.activateCheckbox(this) ><p>" + this.str[result[i]] + '</p><input name="search_result" type="radio" value="'+ result[i] +'"></div> <br>';
                    hasResult = true;
                }
            }
            
            if ($('input[name=search_result]:checked').length > 0) {
                ////console.log("reach");
                this.ifClickedRadio = true; 
            }   

            if(hasResult == false) {
                // z.innerHTML += "<div class='result-card'><p>No Result</p></div>";
                z.innerHTML = "";
                z.classList.add('remove-result');
            }
        // }
        // else {
        //     z.innerHTML = "Other boxes";
        // }
    }

    activateCheckbox(container){
        let checkbox = container.querySelector('input[type="radio"]');
        checkbox.click();
        this.checkRadioButton();
    }

    atLeastOneRadio(){
        return ($('input[type=radio]:checked').length > 0);
    }

    checkRadioButton(){
        if(this.atLeastOneRadio() == true) {
            let result = document.getElementsByName('search_result');
            for(let i = 0; i < result.length; i++) {
                if(result[i].checked) {
                    localStorage.setItem("search_result", JSON.stringify(result[i].value));
                }
            }
        
            let ifSubtree = document.getElementsByName('ifSubtree');
            for(let i = 0; i < ifSubtree.length; i++) {
                if(ifSubtree[i].checked) {
                    localStorage.setItem("ifSubtree", JSON.stringify(ifSubtree[i].value));
                }
            }
            localStorage.setItem("ifSearch", JSON.stringify('yes'));
            this.render();
        }
    }
}

let selectClick = (e, sender) =>
    DecisionTree.selectClick(e, sender);

// window.addEventListener('DOMContentLoaded', ()=>{
//     window.setInterval(DecisionTree.checkRadioButton(), 1000);
// })
