/**
 * Fetches user information and updates the DOM with the user's name and email.
 */
function fetchUserInfo() {
    fetch('/user-info')
        .then(response => response.json())
        .then(data => {
            document.getElementById('userDetails').innerHTML = `<b>User Name</b>: ${data.username} | <b>Email</b>: ${data.email}`;
        })
        .catch(error => console.error('Error fetching user info:', error));
}

/**
 * Event listener that fetches todos and user info when the DOM content has fully loaded.
 * It also sets up the event listener for the todo form submission.
 */
document.addEventListener('DOMContentLoaded', function () {
    fetchTodos();
    fetchUserInfo();

    document.getElementById('todoForm').addEventListener('submit', function (e) {
        e.preventDefault();
        addTodo();
    });
});


/**
 * Fetches the list of todos from the server, 
 * creates the todo elements, and inserts them into the DOM.
 */
function fetchTodos() {
    fetch('/api/todos')
        .then(response => response.json())
        .then(todos => {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = ''; // Clear existing todos
            todos.forEach((todo, index) => {
                const row = document.createElement('tr');
                if (todo.completed) {
                    row.classList.add('table-success');
                }

                // Add index
                const indexCell = document.createElement('th');
                indexCell.scope = 'row';
                indexCell.textContent = index + 1;
                row.appendChild(indexCell);

                // Add completed checkbox
                const completedCell = document.createElement('td');
                completedCell.classList.add('text-center');
                const completeCheckbox = document.createElement('input');
                completeCheckbox.type = 'checkbox';
                completeCheckbox.checked = todo.completed;
                completeCheckbox.className = 'form-check-input';
                completeCheckbox.onchange = function () {
                    toggleTodoComplete(todo._id, completeCheckbox.checked);
                    if (completeCheckbox.checked) {
                        row.classList.add('table-success');
                    } else {
                        row.classList.remove('table-success');
                    }
                };
                completedCell.appendChild(completeCheckbox);
                row.appendChild(completedCell);

                // Add todo content
                const contentCell = document.createElement('td');
                contentCell.textContent = todo.content;
                row.appendChild(contentCell);

                // Add creation date
                const dateCell = document.createElement('td');
                const creationDate = new Date(todo.createdAt).toLocaleDateString();
                dateCell.textContent = creationDate;
                row.appendChild(dateCell);

                // Add actions (Buttons)
                const actionsCell = document.createElement('td');
                const editButton = document.createElement('button');
                editButton.innerHTML = 'Edit';
                editButton.className = 'btn btn-info btn-sm';
                editButton.onclick = function () { editTodo(todo._id, todo.content); };
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = 'Delete';
                deleteButton.className = 'btn btn-danger btn-sm ms-2';
                deleteButton.onclick = function () { deleteTodo(todo._id); };
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);

                todoList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching todos:', error));
}

/**
 * Submits a new todo item to the server and refreshes the todo list in the DOM.
 */
function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const content = todoInput.value.trim();
    if (content) {
        fetch('/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        })
            .then(response => response.json())
            .then(todo => {
                todoInput.value = ''; // Clear input field
                fetchTodos(); // Refresh the list
            })
            .catch(error => console.error('Error adding todo:', error));
    }
}

/**
 * Sends a request to delete a specific todo by its ID 
 * and refreshes the list upon completion.
 */
function deleteTodo(todoId) {
    fetch(`/todos/${todoId}`, {
        method: 'DELETE',
    })
        .then(() => {
            fetchTodos(); // Refresh the list
        })
        .catch(error => console.error('Error deleting todo:', error));
}

/**
 * Toggles the completed status of a todo item and updates the list in the DOM.
 */
function toggleTodoComplete(todoId, isCompleted) {
    fetch(`/todos/${todoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: isCompleted }),
    })
        .then(() => {
            fetchTodos(); // Refresh the list
        })
        .catch(error => console.error('Error updating todo:', error));
}


/**
 * Prompts the user to edit the content of a todo and sends the update to the server.
 */
function editTodo(todoId, currentContent) {
    const newContent = prompt("Edit your todo:", currentContent);
    if (newContent !== null && newContent !== currentContent) {
        fetch(`/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: newContent }),
        })
            .then(() => {
                fetchTodos(); // Refresh the list
            })
            .catch(error => console.error('Error updating todo:', error));
    }
}


