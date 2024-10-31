import { AddTask, GetTasks, DeleteTask } from '../wailsjs/go/main/App';

async function addTask() {
    console.log('addTask called');
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const targetTimeValue = document.getElementById('taskTargetTime').value;
    console.log('Input values:', { name, description, targetTimeValue });

    const targetTime = new Date(targetTimeValue);

    const id = await AddTask(name, description, targetTime.toISOString());
    console.log('Task added with ID:', id);
    renderTasks();
}

async function renderTasks() {
    const tasks = await GetTasks();
    const tasksDiv = document.getElementById('tasks');
    tasksDiv.innerHTML = '';

    for (const id in tasks) {
        const task = tasks[id];
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.innerHTML = `
            <h3>${task.Name}</h3>
            <p>${task.Description}</p>
            <p>Target Time: ${new Date(task.TargetTime).toLocaleString()}</p>
            <button onclick="deleteTask(${task.ID})">Delete</button>
            <div class="timer" id="timer-${task.ID}"></div>
        `;
        tasksDiv.appendChild(taskDiv);
        startTimer(task.ID, new Date(task.TargetTime));
    }
}

async function deleteTask(id) {
    await DeleteTask(id);
    renderTasks();
}

function startTimer(taskId, targetTime) {
    const timerDiv = document.getElementById(`timer-${taskId}`);
    const interval = setInterval(() => {
        const now = new Date();
        const diff = targetTime - now;
        if (diff <= 0) {
            clearInterval(interval);
            timerDiv.style.backgroundColor = 'green';
            return;
        }
        const totalDuration = targetTime - new Date(targetTime.getTime() - 3600000); // 1 hour duration
        const percentage = diff / totalDuration;
        const size = percentage * 100;
        timerDiv.style.width = `${size}px`;
        timerDiv.style.height = `${size}px`;
        timerDiv.style.backgroundColor = `rgba(255, 0, 0, ${1 - percentage})`;

        // Auditory alerts
        if (diff <= 3600000 && diff > 3599000) { // 1 hour left
            new Audio('1_hour_left.mp3').play();
        } else if (diff <= 1800000 && diff > 1799000) { // 30 minutes left
            new Audio('30_minutes_left.mp3').play();
        } else if (diff <= 600000 && diff > 599000) { // 10 minutes left
            new Audio('10_minutes_left.mp3').play();
        }
    }, 1000);
}

renderTasks();

window.addTask = addTask;
window.deleteTask = deleteTask;