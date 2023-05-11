function decision_node(arr, id, s='', ifCheckbox = true, elif_ = false){
    let unique_id = "id_"+Math.floor(Math.random()*(10**12));
    let str = DecisionTree.str;
    let val = `<div id="d1" data-modal-id="${id}" style="
                    background-color: #f3b058 !important;
                    width: 100%;
                    cursor: pointer;
                    margin-bottom: 7px;" uid="${unique_id}" ontouchend=openModal(this)>
                    <p> ${s} </p>
                </div>`;
            
    if (arr[id].length > 0 && arr[id].length <= 5) {
        val = `${val}
                    <div>
                        <select style='width: 100px;' data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}">
                            <option value="none" selected></option>`;
        for (var i = 0; i < arr[id].length; i++) {
            
            let len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
        val += `<option value="NotSure">NotSure</option>`;
        val += `</select></div>`;
    }else if(elif_ && arr[id].length > 5) {
        ifCheckbox = true;
        val += '<form action="#" method="post" id="checkbox_form"">';
        for (var i = 0; i < arr[id].length; i++) {
            let len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<div class="checkbox">
                        <label><input type="checkbox" value="${arr[id][i]}">${s1}</label>
                    </div>`;
            // <input type="checkbox" name="option" class="checkbox" value="` + arr[id][i] + `" />` + s1 + `<br />`;                    
        }
        // onclick="checkboxAnswers(' + id + ',' + originNode + ');
        val += '<button type="button" id = cb-button class="btn btn-primary" >Submit</button>';
        val += '</form>';
    }
    
    return {val, ifCheckbox, unique_id};
}

var modal = document.querySelector('#NodeOverviewModal');
let instanceModal = document.querySelector("#SavedInstancesModal");
  // let is_maximized = false;

function dismiss() {
    modal.isOpen = false;
    modal.canDismiss = true;
    let update = document.querySelector('#curr_options');
    if(update)
        update.remove();
    modal.dismiss();
}

function dismissInstanceModal(){
    instanceModal.isOpen = false;
    instanceModal.canDismiss = true;
    
    const instanceContainer = document.querySelector("#instancecontainer");
    const nameContainer = document.querySelector(".instanceNameContainer");

    instanceContainer.innerHTML = "";
    nameContainer.innerHTML = "";
    instanceModal.dismiss();
    DecisionTree.autoDraw = false;

}

async function Toast(msg, msgType = 'error') {
    const notification = document.querySelector("#toast_container");
    notification.querySelector("label").innerText = msg;
    notification.classList.add(msgType);
    setTimeout(()=>{
        // remove the class 
        notification.classList.remove(msgType);
    }, 1000);
}

const searchInput = document.querySelector('ion-searchbar');
let cancelButton = undefined;

function exc_search() {
    searchInput.querySelector("input").id = "input";
    DecisionTree.input_search();
}


searchInput.addEventListener('keydown', (e)=>{
    if(e.keyCode==13 || e.code == "Enter"){
        exc_search();
    }

    if(cancelButton == undefined){
        cancelButton = searchInput.querySelector("button");
        cancelButton.addEventListener("click", ()=>{
            document.querySelector(".search-results").classList.remove("show");
            document.querySelector(".search-results").classList.add("hide");
        });
    }
});

let lastTouchEnd = 0;
function openModal(header){
    const now = (new Date()).getTime();
    if(now - lastTouchEnd > 300) {
        lastTouchEnd = now;
        return;
    }
    
    if(header == null || header == undefined) return false;
    // Initialize the necessary variables 
    const node = header.parentNode;
    const id = header.getAttribute('data-modal-id'); 
    const question = header.textContent;
    let pResponse = node.querySelector('select'); // Possible responses for the question
    let is_form = false;
    const question_el = document.querySelector('#_question');
    question_el.textContent = question;

    try{
    if(pResponse == null){
        is_form = true;
        pResponse = node.querySelector('form'); 
        pResponse = Array.from(pResponse.querySelectorAll('.checkbox'));
        pResponse = pResponse.map( x => [x.querySelector('input').value, x.textContent.trim()]);
    }else{
        pResponse = Array.from(pResponse.querySelectorAll('option'));
        pResponse = pResponse.map( x => [x.value, x.textContent.trim()]);
    }

    // UI
    const modal_container = document.querySelector('.node_display');

    // if(!is_form){
        const choices = document.createElement('div');
        choices.setAttribute('class', 'q_responses');
        choices.setAttribute('id', 'curr_options');

        pResponse.forEach(response => {

            // to exclude no choice from appearing on the modal
            // uncomment the following if statement
            if(response[1].length == "")
                return;

            let container = document.createElement('div');
            container.setAttribute('class', 'checkbox');

            let label = document.createElement('div');
            label.setAttribute('class', 'answer');

            let option = document.createElement('input');
            option.setAttribute('type', 'radio');
            // option.setAttribute('onchange',);
            option.setAttribute('value', response[0]);

            label.textContent = (response[1].length<=0)?"BLANK":response[1];
            container.appendChild(option);
            container.appendChild(label);
            choices.appendChild(container);

            container.addEventListener('click', (elm)=>{
                let parentNode = elm.target.parentNode.parentNode;
                elm = elm.target.parentNode;
                const options = parentNode.querySelectorAll('input');

                options.forEach(option=>{
                    option.checked = false;
                });

                if(!is_form){
                    const curr_checkbox = elm.querySelector('input');
                    const node_select_elm = node.querySelector('select');
                    node_select_elm.value = curr_checkbox.value;
                    curr_checkbox.checked = true;
                    dismiss();
                    node_select_elm.dispatchEvent(new Event('change'));
                }else{
                    const curr_checkbox = parentNode.querySelector('input');
                    const index = options.indexOf(curr_checkbox);
                    curr_checkbox.checked = true;
                    console.log(index,  node.querySelectorAll('input'));
                    node.querySelectorAll('input')[index].checked = curr_checkbox.checked;
                    
                    dismiss();
                    checkboxAnswers();
                }
                
            }, true);
        });
        modal_container.appendChild(choices);
    // }
    }catch(e){
        //pass
    }

    modal.canDismiss = false;
    modal.isOpen = true;
}

function upload_file(){
    const attach = document.querySelector('#file_attach');
    attach.click();
}

function active_node(node){
    const active = document.querySelector(".active_node");
    if(active != null){
        active.classList.remove('active_node');
    }

    node.classList.add('active_node');
}

function fresh_start(){
    cleanCanvas();
    input();
}


function displayInstanceContent(content){
    let items = localStorage.getItem('DTree');
    items = (items == undefined || items.trim().length == 0)? [] : items;
    items = (typeof(items) !== "string")? items: JSON.parse(items);
    
    const instanceContainer = document.querySelector("#instancecontainer");
    const renderInstance = document.querySelector("#renderInstance");
    const removeInstance = document.querySelector("#removeInstance");

    const idx = content.getAttribute('idx');
    const key = content.getAttribute('key');

    localStorage.setItem('idx', idx);
    localStorage.setItem('key', key);

    renderInstance.addEventListener('click', ()=>{
        DecisionTree.renderInstance()
    });
    removeInstance.addEventListener('click', ()=>{ 
        DecisionTree.removeInstance() });
    // instanceContainer.innerHTML = items[idx][key];
    const fname = items[idx]['fileName'];
    const date = items[idx]['date'];
    // const templates 
    instanceContainer.innerHTML = `File Name: <label><b>${fname}</b></label></br> date: <b>${date}</b>`;
    let nodes = JSON.parse(items[idx][key]).items.filter(x=> x.__type == "MindFusion.Diagramming.ControlNode");
    nodes = nodes.map(x=> x.template);
    
    const regex = /<p>(.*?)<\/p>/s;
    nodes = nodes.map(x=> x.match(regex)[1]);

    nodes.forEach(node =>{
        instanceContainer.innerHTML += `
           <div class='result-card' style='margin-top:5px; margin-bottom:3px; padding:4px; border-radius:0px;'>${node}</div> 
        `;
    });
}

function openSavedInstances(header){
    const nameContainer = document.querySelector(".instanceNameContainer");

    let items = localStorage.getItem('DTree');
    items = (items == undefined || items.trim().length == 0)? [] : items;
    items = (typeof(items) !== "string")? items: JSON.parse(items);
    let index = 0;

    items.forEach((item)=>{
        let key = Object.keys(item)[0];
        let input = document.createElement('input');
        input.setAttribute('type','text');
        input.setAttribute('placeholder', key);
        input.setAttribute('idx', index);
        input.setAttribute('key', key);
        // input.setAttribute('readonly', 'true');
        // input.setAttribute('onclick', "this.readOnly='';");
        input.setAttribute('onclick', `displayInstanceContent(this)`);
        input.setAttribute('onkeyup', `DecisionTree.updateInstance(this)`);
        input.style.cssText = `width:100%; padding-left: 6px;`;
        nameContainer.appendChild(input);
        index++;
    });
    var event = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
    if(items.length > 0)
        document.querySelector('[idx="0"]').dispatchEvent(event);;
        
    instanceModal.canDismiss = false;
    instanceModal.isOpen = true;
}

