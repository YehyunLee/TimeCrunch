import { AddTask, GetTasks, DeleteTask } from '../wailsjs/go/main/App';

// Keep track of intervals to clear them when needed
const timerIntervals = {};

async function addTask() {
    const name = document.getElementById('taskName').value;
    const description = document.getElementById('taskDescription').value;
    const targetTimeValue = document.getElementById('taskTargetTime').value;

    const targetTime = new Date(targetTimeValue);

    await AddTask(name, description, targetTime.toISOString());
    renderTasks();
}

async function renderTasks() {
    const tasks = await GetTasks();
    const tasksDiv = document.getElementById('tasks');
    tasksDiv.innerHTML = '';

    // Clear existing intervals
    for (const id in timerIntervals) {
        clearInterval(timerIntervals[id]);
    }

    for (const id in tasks) {
        const task = tasks[id];
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.innerHTML = `
            <h3>${task.Name}</h3>
            <p>${task.Description}</p>
            <p>Target Time: ${new Date(task.TargetTime).toLocaleString()}</p>
            <button onclick="deleteTask(${task.ID})">Delete</button>
            <canvas class="timerCanvas" id="timer-${task.ID}" width="100" height="100"></canvas>
        `;
        tasksDiv.appendChild(taskDiv);
        startTimer(task.ID, new Date(task.TargetTime));
    }
}

async function deleteTask(id) {
    clearInterval(timerIntervals[id]);
    await DeleteTask(id);
    renderTasks();
}

function startTimer(taskId, targetTime) {
    const canvas = document.getElementById(`timer-${taskId}`);
    const ctx = canvas.getContext('2d');
    const totalDuration = targetTime - new Date();

    timerIntervals[taskId] = setInterval(() => {
        const now = new Date();
        const diff = targetTime - now;
        const percentage = diff / totalDuration;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the background circle (full circle)
        ctx.beginPath();
        ctx.arc(50, 50, 48, 0, 2 * Math.PI);
        ctx.fillStyle = '#ccc';
        ctx.fill();

        // Draw the remaining time arc (counter-clockwise)
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.arc(
            50,
            50,
            48,
            -0.5 * Math.PI,
            (-0.5 * Math.PI) - (2 * Math.PI * percentage),
            true // Set anticlockwise to true
        );
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();

        if (diff <= 0) {
            clearInterval(timerIntervals[taskId]);
            // Draw a full circle to indicate time's up
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(50, 50, 48, 0, 2 * Math.PI);
            ctx.fillStyle = 'green';
            ctx.fill();
        }

    }, 1000);
}

renderTasks();

window.addTask = addTask;
window.deleteTask = deleteTask;