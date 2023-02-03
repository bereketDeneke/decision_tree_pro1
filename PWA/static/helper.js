function decision_node(arr, id, s='', ifCheckbox = true, elif_ = false){
    let val = `<div id="d1" data-modal-id="${id}" style="
                    background-color: #f3b058 !important;
                    width: 100%;
                    margin-bottom: 7px;" onclick=openModal(this)>
                    <p> ${s} </p>
                </div>`;
            
    if (arr[id].length > 0 && arr[id].length <= 5) {
        val = `${val}
                    <div>
                        <select style='width: 100px;' data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}">
                            <option value="none" selected></option>`;
        for (var i = 0; i < arr[id].length; i++) {
            
            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
        val += `<option value="NotSure">NotSure</option>`;
        val += `</select></div>`;
    }else if(elif_ && arr[id].length > 5) {
        ifCheckbox = true;
        val += '<form action="#" method="post" id="checkbox_form"">';
        for (var i = 0; i < arr[id].length; i++) {
            len1 = str[arr[id][i]].search(',');
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

    return {val, ifCheckbox};
}


function openModal(header){
    if(header == null || header == undefined) return false;

    // Initialize the necessary variables 
    const node = header.parentNode;
    const id = header.getAttribute('data-modal-id'); 
    const question = header.textContent;
    let response = node.querySelector('select');
    let is_form = false;

    if(response == null){
        is_form = true;
        response = node.querySelector('form'); 
        response = Array.from(response.querySelectorAll('.checkbox'));
        response = response.map( x => [x.querySelector('input').value, x.textContent.trim()]);
    }else{
        response = Array.from(response.querySelectorAll('option'));
        response = response.map( x => [x.value, x.textContent.trim()]);
    }
    // console.log(question, response);

    // construct the UI
    // console.log(modal.isOpen);
    // modal.open();
    modal.canDismiss = false;
    modal.isOpen = true;
    // const body = document.querySelector('body');
    // const overlay = document.createElement('div');    
    // const center_content = document.createElement('center');

    // overlay.style = `
    //     position:absolute; 
    //     background-color:rgb(71 66 66 / 60%); 
    //     width: 100%;
    //     height: 100%;
    //     z-index: 1000;
    // `;
    

    // overlay.addEventListener('click', function(){
    //     body.removeChild(overlay);
    //     body.removeChild(center_content);
    // }, true);

    // body.appendChild(overlay);
    // center_content.innerHTML = `
    //     <div class='modal_container'>
    //         <div class="question">
    //             ${question}
    //         </div>
    //     </div>
    // `;

    // body.appendChild(center_content);
}