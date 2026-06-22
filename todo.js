// ==================== DATA & SETTINGS ====================

// All our to-do items live in this array
// Each item looks like: { id: "abc123", text: "Buy milk", completed: false }
let todos = [];
let currentFilter = "all"; // "all", "active", or "completed"

// Get references to HTML elements we need to work with
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const empty = document.getElementById("todo-empty");
const countDisplay = document.getElementById("todo-count");
const clearBtn = document.getElementById("todo-clear");
const filterContainer = document.getElementById("todo-filters");

// ==================== LOCAL STORAGE (save & load) ====================

function loadTodos() {
  let saved = localStorage.getItem("ph-todos");
  if (saved) {
    todos = JSON.parse(saved);
  } else {
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem("ph-todos", JSON.stringify(todos));
}

// ==================== HELPERS ====================

function makeId() {
  // Creates a unique ID using current time + random numbers
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function activeCount() {
  // Count how many todos are NOT completed
  let count = 0;
  for (let i = 0; i < todos.length; i++) {
    if (!todos[i].completed) count++;
  }
  return count;
}

// ==================== FILTERING ====================

function getVisibleTodos() {
  if (currentFilter === "active") {
    // Only return uncompleted todos
    return todos.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    // Only return completed todos
    return todos.filter(t => t.completed);
  } else {
    // Return everything
    return todos;
  }
}

function setFilter(filterName) {
  currentFilter = filterName;

  // Update which filter button looks "active"
  let buttons = document.querySelectorAll(".filter-btn");
  for (let i = 0; i < buttons.length; i++) {
    let btn = buttons[i];
    if (btn.dataset.filter === filterName) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
  }

  render();
}

// ==================== RENDER (draw the list) ====================

function render() {
  let visible = getVisibleTodos();

  // Clear the list and rebuild it
  list.innerHTML = "";

  for (let i = 0; i < visible.length; i++) {
    let todo = visible[i];
    let li = createTodoItem(todo);
    list.appendChild(li);
  }

  // Update the "X tasks left" text
  let active = activeCount();
  if (todos.length === 0) {
    countDisplay.textContent = "";
  } else {
    let word = active === 1 ? "task" : "tasks";
    countDisplay.textContent = active + " " + word + " left";
  }

  // Show/hide the "Clear Completed" button
  let hasCompleted = false;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].completed) hasCompleted = true;
  }
  clearBtn.style.display = hasCompleted ? "inline-flex" : "none";

  // Show/hide the empty state message
  if (todos.length === 0) {
    empty.querySelector("p").textContent = "No tasks yet. Add one above!";
    empty.style.display = "block";
  } else if (visible.length === 0) {
    empty.querySelector("p").textContent = "No " + currentFilter + " tasks.";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
  }
}

// ==================== CREATE ONE TODO ITEM ====================

function createTodoItem(todo) {
  // <li class="todo-item">
  let li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;
  if (todo.completed) {
    li.classList.add("is-completed");
  }

  // <input type="checkbox" class="todo-checkbox">
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.completed;

  // <label class="todo-text">Buy milk</label>
  let label = document.createElement("label");
  label.className = "todo-text";
  label.textContent = todo.text;
  label.setAttribute("aria-label", "Task: " + todo.text);

  // <input type="text" class="todo-edit-input"> (hidden until double-click)
  let editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;
  editInput.setAttribute("aria-label", "Edit task");

  // <button class="todo-delete">Delete</button>
  let deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "todo-delete";
  deleteBtn.textContent = "Delete";

  // Put everything inside the <li>
  li.appendChild(checkbox);
  li.appendChild(label);
  li.appendChild(editInput);
  li.appendChild(deleteBtn);

  return li;
}

// ==================== CRUD OPERATIONS ====================

function addTodo(text) {
  text = text.trim();
  if (text === "") return; // Don't add empty tasks

  todos.push({
    id: makeId(),
    text: text,
    completed: false
  });

  saveTodos();
  render();
}

function deleteTodo(id) {
  let newTodos = [];
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id !== id) {
      newTodos.push(todos[i]);
    }
  }
  todos = newTodos;

  saveTodos();
  render();
}

function toggleTodo(id) {
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todos[i].completed = !todos[i].completed;
    }
  }

  saveTodos();
  render();
}

function updateTodoText(id, newText) {
  newText = newText.trim();
  if (newText === "") return;

  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todos[i].text = newText;
    }
  }

  saveTodos();
  render();
}

function clearCompleted() {
  let remaining = [];
  for (let i = 0; i < todos.length; i++) {
    if (!todos[i].completed) {
      remaining.push(todos[i]);
    }
  }
  todos = remaining;

  saveTodos();
  render();
}

// ==================== EVENT HANDLERS ====================

// -- Form submit: add a new task --
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Stop the page from reloading
  let text = input.value.trim();
  if (text !== "") {
    addTodo(text);
    input.value = ""; // Clear the input
    input.focus();    // Put cursor back in the input
  }
});

// -- Click events on the list (checkbox toggle + delete) --
list.addEventListener("click", function (event) {
  let item = event.target.closest(".todo-item");
  if (!item) return;
  let id = item.dataset.id;

  // If they clicked the checkbox, toggle complete/incomplete
  if (event.target.classList.contains("todo-checkbox")) {
    toggleTodo(id);
  }

  // If they clicked the Delete button, remove the task
  if (event.target.classList.contains("todo-delete")) {
    deleteTodo(id);
  }
});

// -- Double-click on a task to edit it --
list.addEventListener("dblclick", function (event) {
  let label = event.target.closest(".todo-text");
  if (!label) return;

  let item = label.closest(".todo-item");
  item.classList.add("is-editing");

  let editInput = item.querySelector(".todo-edit-input");
  editInput.value = label.textContent;
  editInput.focus();
  editInput.select();
});

// -- Keyboard events while editing (Enter = save, Escape = cancel) --
list.addEventListener("keydown", function (event) {
  if (!event.target.classList.contains("todo-edit-input")) return;

  if (event.key === "Enter") {
    // Save the edit
    let item = event.target.closest(".todo-item");
    let id = item.dataset.id;
    updateTodoText(id, event.target.value);
    item.classList.remove("is-editing");
  }

  if (event.key === "Escape") {
    // Cancel the edit (restore original text)
    let item = event.target.closest(".todo-item");
    let label = item.querySelector(".todo-text");
    event.target.value = label.textContent;
    item.classList.remove("is-editing");
  }
});

// -- Clicking filter buttons (All / Active / Completed) --
filterContainer.addEventListener("click", function (event) {
  let btn = event.target.closest(".filter-btn");
  if (!btn) return;
  setFilter(btn.dataset.filter);
});

// -- Clear Completed button --
clearBtn.addEventListener("click", function () {
  clearCompleted();
});

// ==================== START UP ====================

loadTodos();
setFilter("all");
