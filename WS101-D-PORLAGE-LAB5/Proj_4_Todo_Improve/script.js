// My API
const api = {
    // Unsafe but still works
    API_BASE : `http://localhost:8080/users/darshan/todos`,
    setUserAPI(user) {
        return this.API_BASE = `http://localhost:8080/users/${user}/todos`
    },
    getTasks() {
        return fetch(this.API_BASE, {method: 'GET'}).then(res => {
            return res.json();
        });
    },
    createTask(task) {
        return fetch(this.API_BASE, {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(task)
        }).then(r => {
            return r.json()
        });
    },
    updateTask(task) {
        return fetch(`${this.API_BASE}/${encodeURIComponent(task.id)}`,{
            method: 'PUT',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(task)
        }).then(r => {
            return r.json()
        });
    },
    deleteTask(task) {
        return fetch(`${this.API_BASE}/${encodeURIComponent(task.id)}`,{
            method: 'DELETE'
        }).then(r => {
            return r
        });
    },
    getTask(task) {
        return fetch(`${this.API_BASE}/${encodeURIComponent(task.id)}`,{
            method: 'GET',
        }).then(r => {
            return r.json()
        });
    }
}


// =================================== Head-Functions ===================================
const taskForm = document.querySelector('.todo-add-task');
const container = document.querySelector('[data-taskContainer]');
const displayCtrl = document.querySelector('[data-display-ctrl]');
const dataCount = document.querySelector('[data-count]');

const userUi = document.querySelector('[data-user-ui]');
const userModal = document.querySelector('[data-user-modal]');
const userModalClose = document.querySelector('[data-user-modal-close]');

const addUserBtn = document.querySelector('[data-add-user]');
const addUserModal = document.querySelector("[data-add-user-modal]");
const addUserForm = document.querySelector(".add-user-form");
const closeModalBtn = document.querySelector('[data-close-modal-btn]');

const currentUser = document.querySelector('[data-cur-user]');
// Form handling
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(taskForm);
    addTask(data.get('description'), data.get('target-date'));
    taskForm.reset();
});

addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(addUserForm);
    if (!userStorageList.includes(data.get('username'))) {
        userStorageList.push(data.get('username'));
    } else {
        alert("Username already exist...");
    }
    setCurrentUser(data.get('username'), container.dataset.state);
    syncUser();
    closeModal(addUserModal, userModal);
    addUserForm.reset();
});

// Modal Handling
userUi.addEventListener('click', () => userModal.showModal());
closeModalBtn.addEventListener('click', () => closeModal(addUserModal))
userModalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal(userModal);
});

addUserBtn.addEventListener('click', () => addUserModal.showModal());

// modal closing
function closeModal(...modals) {
    modals.forEach(modal => modal.close())
}

// =================================== Storage-Task-Management ===================================
let id = localStorage.getItem('latest') ? Number(localStorage.getItem('latest')) : 1;
const userStorage = localStorage.getItem('userList');
const userStorageList = userStorage ? JSON.parse(userStorage) : [];
//  Async Rendering: Supports legacy code

async function asyncRender(state) {
    try {
        const res = await api.getTasks();
        renderTask([...res], state);
    } catch (err) {
        console.error(err);
    }
}

asyncRender();

// localStorage.clear()
// User Management
const recentUserList = document.querySelector('[data-recent-users]');

recentUserList.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log(e.target);

    if ((e.target.id === 'login') && (e.target.nodeName === 'BUTTON')) {
        const temp = currentUser.textContent;
        if (!userStorageList.includes(temp)) userStorageList.push(temp);
        setCurrentUser(e.target.parentElement.previousSibling.textContent, container.dataset.state);
        syncUser();
        closeModal(userModal);
    }

    if ((e.target.id === 'remove') && (e.target.nodeName === 'BUTTON')) {
        userStorageList.splice(userStorageList.indexOf(document.querySelector('.recent-user > p').textContent), 1);
        syncUser();
        closeModal(userModal);
    }

});
loadUserRecent();
// sync function 
function syncUser() {
    saveUserRecent();
    loadUserRecent();
}

// Save & load recent users from local stroage
function saveUserRecent() {
    localStorage.setItem('userList', JSON.stringify(userStorageList))
}

function loadUserRecent() {
    if (!userStorageList) return;
    const frag = document.createDocumentFragment()
    for (const element of userStorageList) {
        if (!(element === currentUser.textContent)) frag.appendChild(createUserEl(element));
    }
    recentUserList.replaceChildren(frag)
}

async function setCurrentUser(user, state) {
    api.setUserAPI(user);
    setUserUi(user);
    asyncRender(state);
}

function getCurrentUser() {
    return currentUser.textContent;
}
// Interactive display Handling
displayCtrl.addEventListener('click', (e) => {
    if (!e.target.matches('[data-active]')) return;

    for (const child of displayCtrl.children) {
        if (child.dataset) {
            child.dataset.active = (child === e.target).toString();
        }
    }

    if (e.target.dataset.state) {
        container.dataset.state = e.target.dataset.state;
        return asyncRender(container.dataset.state);
    }

    container.dataset.state = 'all';
    return asyncRender(container.dataset.state);
});

function renderTask(taskObjs, state) {
    // Filter state: return state either active or completed
    if (state != null && state !== 'all') {
        taskObjs = [...taskObjs].filter(task => task.done === (state === 'completed'));
    }

    const frag = document.createDocumentFragment();
    taskObjs.forEach(taskObj => {
        frag.appendChild(createTodoEl(taskObj))
    });

    container.replaceChildren(frag);
    changeLabel(container);
}


function changeLabel(parent) {
    let curState = parent.dataset.state;
    curState = curState.replace(curState[0], curState[0].toUpperCase());
    dataCount.textContent = `${curState} tasks: ${parent.childElementCount}`;
}

function setUserUi(name) {
    currentUser.textContent = name;
    document.querySelector('[data-username-char]').textContent = name[0].toUpperCase();
}

// =================================== Task-State-Functions ===================================
async function addTask(description, targetDate) {
    try {
        const username = getCurrentUser();
        const task = createTaskObj(username, description, targetDate);
        await api.createTask(task);
        await asyncRender();
        if (container.dataset.state === 'all' || container.dataset.state === 'active') asyncRender(container.dataset.state);
    } catch (err) {
        console.error(err);
    }
}

async function setComplete(input, parent) {
    try {
        const set = input.checked;
        parent.dataset.done = set;

        const task = await api.getTask({ id: parent.id });
        task.done = set;
        await api.updateTask(task);

        const res = await api.getTasks();
        renderTask([...res], container.dataset.state);
    } catch (err) {
        console.error(err);
    }
}

async function deleteTask(parent) {
    try {
        await api.deleteTask({ id: parent.id });
        asyncRender(container.dataset.state);
        changeLabel(container);
    } catch (err) {
        console.error(err);
    }
}

async function updateTask(input, parent, obj) {
    try {
        const task = await api.getTask({ id: parent.id });
        task.description = input.value ? input.value : obj.name;
        await api.updateTask(task);
        input.value = '';
        input.removeAttribute('placeholder');
        viewTemplate(parent, obj);
        asyncRender()
    } catch (err) {
        console.error(err);
    }
}

function createTaskObj(username = "default", description = 'None', targetDate, done) {
    const obj = {};
    obj.id = id;
    obj.username = username;
    obj.description = description;
    obj.targetDate = targetDate ? targetDate : new Date().toLocaleDateString('en-CA');
    obj.done = done ? true : false;
    id++;
    return obj;
}

// =================================== Task-Creation-Functions ===================================

function createTodoEl(obj) {
    const li = document.createElement('li');
    const input = document.createElement('input');
    const span = document.createElement('span');
    const meta = groupEL('task-meta', input, span);
    const usernameP = document.createElement('p');
    const dateP = document.createElement('p');
    usernameP.setAttribute('id', 'userP');
    dateP.setAttribute('id', 'userD');

    const metaUser = groupEL('task-user', usernameP, dateP);
    li.append(metaUser);
    li.append(meta, 'jhem');
    li.setAttribute('class', 'task');
    li.id = obj.id;
    li.dataset.done = obj.done;
    viewTemplate(li, obj);
    return li;
}

function groupEL(className, ...elements) {
    const div = document.createElement('div');
    div.setAttribute('class', className);
    div.append(...elements);
    return div;
}

function createCustomButton(textContent, dataset, callback) {
    const button = document.createElement('button');
    button.textContent = textContent;
    if (dataset) button.setAttribute('data-btn-action', dataset);
    button.addEventListener('click', () => {
        callback();
    })
    return button;
}

function viewTemplate(parent, obj) {
    const input = parent.querySelector('input');
    const span = parent.querySelector('span');
    const userName = parent.querySelector('#userP');
    const userTarget = parent.querySelector('#userD');

    userName.textContent = "Name: " + obj.username;
    userTarget.textContent = "Target: " + obj.targetDate;

    input.type = 'checkbox';
    input.checked = obj.done;
    span.textContent = obj.description;
    span.removeAttribute('class');
    const func = () => setComplete(input, parent);
    input.addEventListener('click', func)
    const editBtn = createCustomButton('Edit', 'edit', () => { editTemplate(parent, obj, func) })
    const delBtn = createCustomButton('Delete', 'delete', () => { deleteTask(parent) })

    const btnCtrls = groupEL("task-ctrls", editBtn, delBtn);
    parent.replaceChild(btnCtrls, parent.lastChild);
}

function editTemplate(parent, obj, func) {
    const input = parent.querySelector('input');
    const span = parent.querySelector('span');
    input.type = 'text';
    input.placeholder = `Enter new description for "${span.textContent}"`;
    span.setAttribute('class', 'hide');
    input.removeEventListener('click', func);
    const cancelBtn = createCustomButton('Cancel', 'cancel', () => { viewTemplate(parent, obj) })
    const saveBtn = createCustomButton('Save', 'save', () => { updateTask(input, parent, obj) })

    const btnCtrls = groupEL("task-ctrls", cancelBtn, saveBtn);
    parent.replaceChild(btnCtrls, parent.lastElementChild);
}

// =================================== User-Element-Functions ===================================
function createUserEl(name) {
    const li = document.createElement('li');
    const p = document.createElement('p');
    const logBtn = document.createElement('button');
    const rmBtn = document.createElement('button');

    p.textContent = name;
    logBtn.textContent = 'login';
    rmBtn.textContent = 'remove';

    logBtn.setAttribute('id', 'login');
    rmBtn.setAttribute('id', 'remove');
    li.setAttribute('class', 'recent-user');
    const meta = groupEL('user-ctrls', rmBtn, logBtn);

    li.append(p, meta);
    return li;
}