

document.getElementById("start-menu-button").addEventListener("click", () => {
    const element = document.getElementById("start-menu");
    element.classList.toggle('inactive');
});




/* =====================
   The one, the only, PLACEHOLDER FUNCTION
   ===================== */
function PH() { //it stands for placeholder
    alert("The placeholder works");
}




function isLocalStorageAvailable(){
  var test = 'test';
  try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
  } catch(e) {
      return false;
  }
}

if(isLocalStorageAvailable()){
  localStorage.setItem("name", "John Doe");
  localStorage.getItem("name");
}else{
  alert("adsf")
}






/* =====================
   Desktop apps
   ===================== */
document.addEventListener('DOMContentLoaded', createApps());


function createApps() {
    const tableLayer1 = document.createElement('table');
    tableLayer1.setAttribute('id', 'desktop-table');
    document.getElementById('desktop-container').appendChild(tableLayer1);

    for (let i = 1; i <= 19; i++) {
        const tableLayer2 = document.createElement('tr');
        tableLayer2.setAttribute('id', 'desktop-table-row-' + String(i));
        document.getElementById('desktop-table').appendChild(tableLayer2);

        for (let i2 = 1; i2 <= 20; i2++) {
            const tableLayer3 = document.createElement('td');
            tableLayer3.setAttribute('id', 'app-cell-' + String(i2 + 20 * (i - 1)));
            tableLayer3.setAttribute('ondrop', 'dropHandler(event)');
            tableLayer3.setAttribute('ondragover', 'dragoverHandler(event)');
            document.getElementById('desktop-table-row-' + String(i)).appendChild(tableLayer3);
        }
    }

    for (let i = 1; i <= 2; i++) {
        const app = document.createElement('img');
        app.setAttribute('id', 'app-' + String(i));
        app.setAttribute('class', 'desktop-app');
        app.setAttribute('src', 'image/directory_closed-4.png');
        app.setAttribute('draggable', 'true');
        app.setAttribute('ondragstart', 'dragstartHandler(event)');
        app.setAttribute('ondragend', 'dragendHandler(event)'); 
        app.setAttribute('ondblclick', 'PH()');

        const targetCell = document.getElementById('app-cell-' + String(i));
        if (targetCell) {
            targetCell.appendChild(app);
        }
    }
}






/* =====================
   Drag & Drop API
   ===================== */

function dragstartHandler(ev) {
    ev.dataTransfer.setData("img", ev.target.id);
    // Timeout allows the "ghost" drag image to look normal while the source turns blue
    setTimeout(() => ev.target.classList.add("dragging"), 0);
}

function dragendHandler(ev) {
    ev.target.classList.remove("dragging");
}

function dragoverHandler(ev) {
    if (ev.target.tagName === 'TD') {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move"; // Shows "allow" cursor
    } else {
        ev.dataTransfer.dropEffect = "none"; // Shows "not-allowed" cursor
    }
}

function dropHandler(ev) {
    if (ev.target.tagName === 'TD') {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("img");
        ev.target.appendChild(document.getElementById(data));
    }
}
















