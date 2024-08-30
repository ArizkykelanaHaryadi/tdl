document.addEventListener("DOMContentLoaded", function () {
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

  // Mengambil data profil dari localStorage
  const savedProfile = JSON.parse(localStorage.getItem("profile"));
  if (savedProfile) {
    document.getElementById("userName").textContent = savedProfile.name;
    document.getElementById("userJobTitle").textContent = savedProfile.jobTitle;
    document.getElementById("userAvatar").src = `img/${savedProfile.avatar}`;
    profileForm.classList.add("hidden");
    toDoSection.classList.remove("hidden");
  }

  // Mengambil data To Do dari localStorage
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  // Menangani pengaturan profil
  submitProfileButton.addEventListener("click", function () {
    const name = document.getElementById("name").value.trim();
    const jobTitle = document.getElementById("jobTitle").value.trim();
    const selectedAvatar = document.querySelector("input[name='avatar']:checked").value;

    if (name === "" || jobTitle === "") {
      showNotification("Name and Job Title cannot be empty.");
      return;
    }

    // Menyimpan informasi profil ke dalam localStorage
    localStorage.setItem("profile", JSON.stringify({ name, jobTitle, avatar: selectedAvatar }));

    // Menyimpan informasi profil ke dalam elemen
    document.getElementById("userName").textContent = name;
    document.getElementById("userJobTitle").textContent = jobTitle;
    document.getElementById("userAvatar").src = `img/${selectedAvatar}`;

    // Menampilkan To Do Section dan menyembunyikan Profile Form
    profileForm.classList.add("hidden");
    toDoSection.classList.remove("hidden");

    showNotification("Profile updated successfully!");
  });

  closeNotificationButton.addEventListener("click", function () {
    notificationPopup.classList.add("hidden");
  });

  // Fungsi untuk menampilkan notifikasi
  function showNotification(message) {
    notificationMessage.textContent = message;
    notificationPopup.classList.remove("hidden");
  }

  // Mengelola To Do List
  const toDoSubmitBtn = document.getElementById("toDoSubmitBtn");
  const toDoList = document.getElementById("toDoList");
  const toDoViewAll = document.getElementById("toDoViewAll");
  const toDoViewDone = document.getElementById("toDoViewDone");
  const toDoViewOverdue = document.getElementById("toDoViewOverdue");
  const toDoDeleteAllBtn = document.getElementById("toDoDeleteAllBtn");

  toDoSubmitBtn.addEventListener("click", function () {
    const date = document.getElementById("toDoDate").value;
    const priority = document.getElementById("toDoPriority").value;
    const description = document.getElementById("toDoDesc").value.trim();

    if (!date || !description) {
      showNotification("Date and Description cannot be empty.");
      return;
    }

    const todo = {
      id: Date.now(),
      date: new Date(date),
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

  // Fungsi untuk merender daftar To Do
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

  // Tentukan kelas warna berdasarkan prioritas
  let priorityColorClass;
  switch (todo.priority.toLowerCase()) {
    case 'low':
      priorityColorClass = 'text-green-500 font-semibold'; 
      break;
    case 'medium':
      priorityColorClass = 'text-yellow-500 font-semibold'; 
      break;
    case 'high':
      priorityColorClass = 'text-red-500 font-semibold';
      break;
  }

  todoElement.innerHTML = `
    <div>
      <p class="font-bold">${todo.description}</p>
      <p class="text-sm ${priorityColorClass}">${todo.date.toLocaleDateString()} - ${todo.priority} Priority</p>
    </div>
    <div class="flex items-center">
      <input type="checkbox" class="mr-2 transform scale-150" id="checkbox-${todo.id}" ${todo.status === "Done" ? "checked" : ""}>
      <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" onclick="deleteTodo(${todo.id})">Delete</button>
    </div>`;

  const checkbox = todoElement.querySelector(`#checkbox-${todo.id}`);
  checkbox.addEventListener("change", function () {
    toggleTodoStatus(todo.id);
  });

  toDoList.appendChild(todoElement);
});

  }

  // Fungsi untuk menghapus To Do
  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList();
    showNotification("To Do deleted successfully!");
  }

  // Fungsi untuk mengganti status To Do
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

  // Fungsi untuk menampilkan pop-up konfirmasi penghapusan semua To Do
  toDoDeleteAllBtn.addEventListener("click", function () {
    confirmDeleteAllPopup.classList.remove("hidden");
  });

  // Tombol konfirmasi dalam pop-up untuk menghapus semua To Do
  confirmDeleteAllButton.addEventListener("click", function () {
    todos = [];
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList();
    showNotification("All To Dos have been deleted!");
    confirmDeleteAllPopup.classList.add("hidden");
  });

  // Tombol batal dalam pop-up
  cancelDeleteAllButton.addEventListener("click", function () {
    confirmDeleteAllPopup.classList.add("hidden");
  });

  // Menampilkan semua To Do
  toDoViewAll.addEventListener("click", function () {
    renderToDoList("All");
  });

  // Menampilkan To Do yang sudah selesai
  toDoViewDone.addEventListener("click", function () {
    renderToDoList("Done");
  });

  // Menampilkan To Do yang lewat jatuh tempo
  toDoViewOverdue.addEventListener("click", function () {
    const today = new Date();
    todos.forEach(todo => {
      if (todo.date < today && todo.status !== "Done") {
        todo.status = "Overdue";
      }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    renderToDoList("Overdue");
  });

  // Fungsi logout untuk mengembalikan ke form profil
  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("profile");
    localStorage.removeItem("todos");
    profileForm.classList.remove("hidden");
    toDoSection.classList.add("hidden");
  });

  // Render daftar To Do saat halaman dimuat
  renderToDoList();
});
