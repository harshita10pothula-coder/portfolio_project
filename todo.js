(function () {
  let STORAGE_KEY = 'ph-todos';
  let state = [];
  let currentFilter = 'all';

  let todoForm = document.querySelector('.todo-form');
  let todoInput = document.querySelector('.todo-input');
  let todoList = document.querySelector('.todo-list');
  let todoEmpty = document.querySelector('.todo-empty');
  let todoCount = document.querySelector('.todo-count');
  let todoClear = document.querySelector('.todo-clear');
  let filterBtns = document.querySelectorAll('.filter-btn');

  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      state = raw ? JSON.parse(raw) : [];
    } catch (e) {
      state = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function getFiltered() {
    if (currentFilter === 'active') return state.filter(t => !t.completed);
    if (currentFilter === 'completed') return state.filter(t => t.completed);
    return state;
  }

  function getActiveCount() {
    return state.filter(t => !t.completed).length;
  }

  function renderCount() {
    let active = getActiveCount();
    let total = state.length;
    if (total === 0) {
      todoCount.textContent = '';
      return;
    }
    let msg = active + ' ' + (active === 1 ? 'task' : 'tasks') + ' left';
    todoCount.textContent = msg;
  }

  function renderClear() {
    let hasCompleted = state.some(t => t.completed);
    todoClear.hidden = !hasCompleted;
  }

  function renderEmpty() {
    let filtered = getFiltered();
    let hasState = state.length > 0;
    if (!hasState || filtered.length === 0) {
      todoEmpty.hidden = false;
      if (hasState && filtered.length === 0) {
        todoEmpty.querySelector('p').textContent = 'No ' + currentFilter + ' tasks.';
      } else {
        todoEmpty.querySelector('p').textContent = 'No tasks yet. Add one above!';
      }
    } else {
      todoEmpty.hidden = true;
    }
  }

  function createTodoElement(todo) {
    let li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' is-completed' : '');
    li.dataset.id = todo.id;

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', 'Mark "' + todo.text + '" as ' + (todo.completed ? 'active' : 'completed'));

    let label = document.createElement('label');
    label.className = 'todo-text';
    label.textContent = todo.text;

    let editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = todo.text;
    editInput.setAttribute('aria-label', 'Edit task');

    let deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'todo-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete "' + todo.text + '"');

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(editInput);
    li.appendChild(deleteBtn);

    return li;
  }

  function render() {
    let filtered = getFiltered();
    todoList.innerHTML = '';
    filtered.forEach(function (todo) {
      todoList.appendChild(createTodoElement(todo));
    });
    renderCount();
    renderClear();
    renderEmpty();
  }

  function addTodo(text) {
    text = text.trim();
    if (!text) return;
    state.push({
      id: generateId(),
      text: text,
      completed: false,
      createdAt: Date.now()
    });
    save();
    render();
  }

  function deleteTodo(id) {
    state = state.filter(t => t.id !== id);
    save();
    render();
  }

  function toggleTodo(id) {
    state.forEach(t => {
      if (t.id === id) t.completed = !t.completed;
    });
    save();
    render();
  }

  function editTodo(id, newText) {
    newText = newText.trim();
    if (!newText) return;
    state.forEach(t => {
      if (t.id === id) t.text = newText;
    });
    save();
    render();
  }

  function clearCompleted() {
    state = state.filter(t => !t.completed);
    save();
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(function (btn) {
      let isActive = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', isActive);
    });
    render();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    let text = todoInput.value.trim();
    if (!text) return;
    addTodo(text);
    todoInput.value = '';
    todoInput.focus();
  }

  function handleListClick(e) {
    let li = e.target.closest('.todo-item');
    if (!li) return;
    let id = li.dataset.id;

    if (e.target.classList.contains('todo-checkbox')) {
      toggleTodo(id);
      return;
    }

    if (e.target.classList.contains('todo-delete')) {
      deleteTodo(id);
      return;
    }
  }

  function handleListDblclick(e) {
    let label = e.target.closest('.todo-text');
    if (!label) return;
    let li = label.closest('.todo-item');
    if (!li) return;
    li.classList.add('is-editing');
    let input = li.querySelector('.todo-edit-input');
    input.value = label.textContent;
    input.focus();
    input.select();
  }

  function handleEditKeydown(e) {
    if (e.key === 'Enter') {
      commitEdit(e.target);
    } else if (e.key === 'Escape') {
      cancelEdit(e.target);
    }
  }

  function handleEditBlur(e) {
    commitEdit(e.target);
  }

  function commitEdit(input) {
    let li = input.closest('.todo-item');
    if (!li) return;
    let id = li.dataset.id;
    let text = input.value.trim();
    if (text) {
      editTodo(id, text);
    }
    li.classList.remove('is-editing');
  }

  function cancelEdit(input) {
    let li = input.closest('.todo-item');
    if (!li) return;
    let label = li.querySelector('.todo-text');
    input.value = label.textContent;
    li.classList.remove('is-editing');
  }

  function handleFilterClick(e) {
    let btn = e.target.closest('.filter-btn');
    if (!btn) return;
    let filter = btn.dataset.filter;
    if (filter === currentFilter) return;
    setFilter(filter);
  }

  function handleClearClick() {
    clearCompleted();
  }

  function init() {
    load();
    setFilter('all');

    todoForm.addEventListener('submit', handleFormSubmit);
    todoList.addEventListener('click', handleListClick);
    todoList.addEventListener('dblclick', handleListDblclick);
    todoList.addEventListener('keydown', function (e) {
      if (e.target.classList.contains('todo-edit-input')) {
        handleEditKeydown(e);
      }
    });
    todoList.addEventListener('blur', function (e) {
      if (e.target.classList.contains('todo-edit-input')) {
        handleEditBlur(e);
      }
    }, true);
    document.querySelector('.todo-filters').addEventListener('click', handleFilterClick);
    todoClear.addEventListener('click', handleClearClick);
  }

  if (document.querySelector('.todo-app')) {
    init();
  }
})();
