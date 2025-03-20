class TodoList {
    constructor() {
        // Initialize properties
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.addTaskBtn = document.getElementById('addTask');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.progressBar = document.getElementById('progressBar');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        
        // Bind methods to maintain 'this' context
        this.addTask = this.addTask.bind(this);
        this.toggleTask = this.toggleTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
        
        this.init();
    }

    init() {
        // Add event listeners
        this.addTaskBtn.addEventListener('click', this.addTask);
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Set up filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.renderTasks();
            });
        });

        // Initial render
        this.renderTasks();
        this.updateProgressBar();
    }

    addTask(e) {
        if (e) e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        if (!taskText) return;

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: this.prioritySelect.value,
            date: new Date().toLocaleDateString(),
            createdAt: new Date().getTime()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.taskInput.value = '';
        this.updateProgressBar();
    }

    toggleTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.saveTasks();
            this.renderTasks();
            this.updateProgressBar();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateProgressBar();
    }

    updatePriority(id, priority) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].priority = priority;
            this.saveTasks();
            this.renderTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    updateProgressBar() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        this.progressBar.style.width = `${percentage}%`;
    }

    getFilteredTasks() {
        switch(this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'high':
                return this.tasks.filter(task => task.priority === 'high');
            default:
                return [...this.tasks];
        }
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        const filteredTasks = this.getFilteredTasks();
        
        // Sort tasks
        filteredTasks.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority] || b.createdAt - a.createdAt;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <span class="task-date">${task.date}</span>
                </div>
                <div class="task-actions">
                    <select class="priority-btn">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                    <button class="delete-btn">❌</button>
                </div>
            `;

            // Add event listeners to the new elements
            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.delete-btn');
            const prioritySelect = li.querySelector('.priority-btn');

            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            prioritySelect.addEventListener('change', (e) => this.updatePriority(task.id, e.target.value));
            
            this.taskList.appendChild(li);
        });
    }
}

// Initialize the Todo List when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoList = new TodoList();
}); 