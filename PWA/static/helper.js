function decision_node(arr, id, s='', ifCheckbox = true, elif_ = false){
    let val = `<div id="d1" data-modal-id="${id}" style="
                    background-color: #f3b058 !important;
                    width: 100%;
                    cursor: pointer;
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
    let pResponse = node.querySelector('select'); // possible responses for the question
    let is_form = false;

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
    const question_el = document.querySelector('#_question');
    const modal_container = document.querySelector('.node_display');
    question_el.textContent = question;

    if(!is_form){
        const choices = document.createElement('div');
        choices.setAttribute('class', 'q_responses');
        choices.setAttribute('id', 'curr_options');

        pResponse.forEach(response => {
            if(response[1].length == "")
                return;
            let container = document.createElement('div');
            container.setAttribute('class', 'checkbox');

            let label = document.createElement('div');
            label.setAttribute('class', 'answer');

            let option = document.createElement('input');
            option.setAttribute('type', 'checkbox');
            option.setAttribute('value', response[0]);

            label.textContent = response[1];
            container.appendChild(option);
            container.appendChild(label);
            choices.appendChild(container);

            container.addEventListener('click', (elm)=>{
                let parentNode = elm.target.parentNode.parentNode;
                elm = elm.target.parentNode;
                const options = parentNode.querySelectorAll('input');

                console.log(options);
                options.forEach(option=>{
                    option.checked = false;
                });
                const curr_checkbox = elm.querySelector('input');
                curr_checkbox.checked = true;
                
            }, true);
        });
        modal_container.appendChild(choices);
    }
    modal.canDismiss = false;
    modal.isOpen = true;
}