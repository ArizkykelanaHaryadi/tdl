document.addEventListener("DOMContentLoaded", () => {
  const submitProfileButton = document.getElementById("submitProfile");
  const notificationPopup = document.getElementById("notificationPopup");
  const notificationMessage = document.getElementById("notificationMessage");
  const closeNotificationButton = document.getElementById("closeNotification");
  const toDoSection = document.getElementById("toDoSection");
  const profileForm = document.getElementById("profileForm");
  const logoutButton = document.getElementById("logoutButton");

  const confirmDeleteAllPopup = document.getElementById("confirmDeleteAllPopup");
  const confirmDeleteAllButton = document.getElementById("confirmDeleteAllButton");
  const cancelDeleteAllButton = document.getElementById("cancelDeleteAllButton");

  // Load profile data from localStorage
  const savedProfile = JSON.parse(localStorage.getItem("profile"));
  if (savedProfile) {
    document.getElementById("userName").textContent = savedProfile.name;
    document.getElementById("userJobTitle").textContent = savedProfile.jobTitle;
    document.getElementById("userAvatar").src = `img/${savedProfile.avatar}`;
    profileForm.classList.add("hidden");
    toDoSection.classList.remove("hidden");
  }

  // Load To Do data from localStorage
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  // Handle profile settings
  submitProfileButton.addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const jobTitle = document.getElementById("jobTitle").value.trim();
    const selectedAvatar = document.querySelector("input[name='avatar']:checked").value;

    if (!name || !jobTitle) {
      showNotification("Name and Job Title cannot be empty.");
      return;
    }

    // Save profile to localStorage
    localStorage.setItem("profile", JSON.stringify({ name, jobTitle, avatar: selectedAvatar }));

    // Update profile elements
    document.getElementById("userName").textContent = name;
    document.getElementById("userJobTitle").textContent = jobTitle;
    document.getElementById("userAvatar").src = `img/${selectedAvatar}`;

    // Show To Do Section and hide Profile Form
    profileForm.classList.add("hidden");
    toDoSection.classList.remove("hidden");

    showNotification("Profile updated successfully!");
  });

  // Handle notification close
  closeNotificationButton.addEventListener("click", () => {
    notificationPopup.classList.add("hidden");
  });

  // Show notification function
  function showNotification(message) {
    notificationMessage.textContent = message;
    notificationPopup.classList.remove("hidden");
  }

  // Handle To Do submissions
  const toDoSubmitBtn = document.getElementById("toDoSubmitBtn");
  const toDoList = document.getElementById("toDoList");
  const toDoViewAll = document.getElementById("toDoViewAll");
  const toDoViewDone = document.getElementById("toDoViewDone");
  const toDoViewOverdue = document.getElementById("toDoViewOverdue");
  const toDoDeleteAllBtn = document.getElementById("toDoDeleteAllBtn");

  toDoSubmitBtn.addEventListener("click", () => {
    const date = new Date(document.getElementById("toDoDate").value);
    const priority = document.getElementById("toDoPriority").value;
    const description = document.getElementById("toDoDesc").value.trim();

    if (!date || !description) {
      showNotification("Date and Description cannot be empty.");
      return;
    }

    const todo = {
      id: Date.now(),
      date,
      priority,
      description,
      status: "To Do"
    };

    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList();
    clearToDoForm();
    showNotification("To Do added successfully!");
  });

  function clearToDoForm() {
    document.getElementById("toDoDate").value = "";
    document.getElementById("toDoPriority").value = "Low";
    document.getElementById("toDoDesc").value = "";
  }

  function renderToDoList(filter = "All") {
  toDoList.innerHTML = "";

  const filteredTodos = todos.filter(todo => {
    if (filter === "Done") return todo.status === "Done";
    if (filter === "Overdue") return todo.status === "Overdue";
    return true;
  });

  if (filteredTodos.length === 0) {
    toDoList.innerHTML = "<p class='text-center font-extrabold text-white'>No To Dos available.</p>";
    return;
  }

  filteredTodos.forEach(todo => {
    const todoElement = document.createElement("div");
    todoElement.classList.add("flex", "justify-between", "items-center", "bg-white", "rounded-md", "p-3", "mb-2");

    // Priority color
    const priorityColorClass = {
      low: 'text-green-500 font-semibold',
      medium: 'text-yellow-500 font-semibold',
      high: 'text-red-500 font-semibold'
    }[todo.priority.toLowerCase()] || '';

    // Description class
    const descriptionClass = todo.status === "Done" ? "strikethrough text-gray-600 font-bold" : "";

    todoElement.innerHTML = `
      <div>
        <p class="font-bold ${descriptionClass}">${todo.description}</p>
        <p class="text-sm ${priorityColorClass}">${todo.date.toLocaleDateString()} - ${todo.priority} Priority</p>
      </div>
      <div class="flex items-center">
        <input type="checkbox" class="mr-2 transform scale-150" id="checkbox-${todo.id}" ${todo.status === "Done" ? "checked" : ""}>
        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${todo.id}">Delete</button>
      </div>`;

    // Event listeners for checkboxes and delete buttons
    const checkbox = todoElement.querySelector(`#checkbox-${todo.id}`);
    checkbox.addEventListener("change", () => toggleTodoStatus(todo.id));

    const deleteButton = todoElement.querySelector(`button[data-id="${todo.id}"]`);
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    toDoList.appendChild(todoElement);
  });

  }

  function toggleTodoStatus(id) {
    todos = todos.map(todo => {
      if (todo.id === id) {
        todo.status = todo.status === "To Do" ? "Done" : "To Do";
      }
      return todo;
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList();
    showNotification("To Do status updated!");
  }

  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList();
    showNotification("To Do deleted successfully!");
  }

  // Show confirmation popup for deleting all To Dos
  toDoDeleteAllBtn.addEventListener("click", () => {
    confirmDeleteAllPopup.classList.remove("hidden");
  });

  // Confirm delete all To Dos
  confirmDeleteAllButton.addEventListener("click", () => {
    todos = [];
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList();
    showNotification("All To Dos have been deleted!");
    confirmDeleteAllPopup.classList.add("hidden");
  });

  // Cancel delete all To Dos
  cancelDeleteAllButton.addEventListener("click", () => {
    confirmDeleteAllPopup.classList.add("hidden");
  });

  // View filters
  toDoViewAll.addEventListener("click", () => renderToDoList("All"));
  toDoViewDone.addEventListener("click", () => renderToDoList("Done"));
  toDoViewOverdue.addEventListener("click", () => {
    const today = new Date();
    todos.forEach(todo => {
      if (todo.date < today && todo.status !== "Done") {
        todo.status = "Overdue";
      }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList("Overdue");
  });

  // Handle logout
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("profile");
    profileForm.classList.remove("hidden");
    toDoSection.classList.add("hidden");
  });

  // Initial render
  renderToDoList();
});
