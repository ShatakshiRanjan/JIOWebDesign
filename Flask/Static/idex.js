document.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('click', event => {
        const taskDetails = event.currentTarget.dataset;

        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, options);
        };

        const formatTime = (timeString) => {
            if (!timeString) return 'N/A';
            const [hours, minutes] = timeString.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes);
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        const taskType = taskDetails.type;

        document.getElementById('details-task').textContent = taskDetails.task;
        document.getElementById('details-dedicated-to').textContent = taskDetails.dedicatedTo;
        document.getElementById('details-description').textContent = taskDetails.description;

        if (taskType === 'event') {
            document.getElementById('details-due-date-time').style.display = 'block';
            document.getElementById('details-start-date-time').style.display = 'none';
            document.getElementById('details-end-date-time').style.display = 'none';
            document.getElementById('details-due-date').textContent = formatDate(taskDetails.dueDate);
            document.getElementById('details-due-time').textContent = formatTime(taskDetails.dueTime);
        } else if (taskType === 'task') {
            document.getElementById('details-due-date-time').style.display = 'none';
            document.getElementById('details-start-date-time').style.display = 'block';
            document.getElementById('details-end-date-time').style.display = 'block';
            document.getElementById('details-start-date').textContent = formatDate(taskDetails.startDate);
            document.getElementById('details-start-time').textContent = formatTime(taskDetails.startTime);
            document.getElementById('details-end-date').textContent = formatDate(taskDetails.endDate);
            document.getElementById('details-end-time').textContent = formatTime(taskDetails.endTime);
        }

        openModal();
    });
});

document.querySelectorAll('.task-item-c').forEach(item => {
    item.addEventListener('click', event => {
        const taskDetails = event.currentTarget.dataset;

        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, options);
        };

        const formatTime = (timeString) => {
            if (!timeString) return 'N/A';
            const [hours, minutes] = timeString.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes);
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        const taskType = taskDetails.type;

        document.getElementById('details-task').textContent = taskDetails.task;
        document.getElementById('details-dedicated-to').textContent = taskDetails.dedicatedTo;
        document.getElementById('details-description').textContent = taskDetails.description;
        document.getElementById('details-completion-date').textContent = formatDate(taskDetails.completionDate);
        if (taskType === 'event') {
            document.getElementById('details-due-date-time').style.display = 'block';
            document.getElementById('details-start-date-time').style.display = 'none';
            document.getElementById('details-end-date-time').style.display = 'none';
            document.getElementById('details-due-date').textContent = formatDate(taskDetails.dueDate);
            document.getElementById('details-due-time').textContent = formatTime(taskDetails.dueTime);
        } else if (taskType === 'task') {
            document.getElementById('details-due-date-time').style.display = 'none';
            document.getElementById('details-start-date-time').style.display = 'block';
            document.getElementById('details-end-date-time').style.display = 'block';
            document.getElementById('details-start-date').textContent = formatDate(taskDetails.startDate);
            document.getElementById('details-start-time').textContent = formatTime(taskDetails.startTime);
            document.getElementById('details-end-date').textContent = formatDate(taskDetails.endDate);
            document.getElementById('details-end-time').textContent = formatTime(taskDetails.endTime);
        }

        openModal();
    });
});

function openModal() {
    document.getElementById('task-details-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function closeModal() {
    document.getElementById('task-details-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

function completeTask(taskId) {
    fetch('/complete_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Task completion failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error completing task:', error);
    });
}

function markIncomplete(taskId) {
    fetch('/mark_incomplete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Marking task incomplete failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error marking task incomplete:', error);
    });
}

document.querySelectorAll('input[type="checkbox"]').forEach(item => {
    item.addEventListener('change', event => {
        if (event.target.checked) {
            completeTask(event.target.value);
        } else {
            markIncomplete(event.target.value);
        }
    });
});

function deleteTask(taskId) {
    fetch('/delete_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Task deletion failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
}

document.querySelectorAll('.delete-button1').forEach(button => {
    button.addEventListener('click', event => {
        event.stopPropagation();
        const taskId = event.currentTarget.parentElement.querySelector('input[type="checkbox"]').value;
        deleteTask(taskId);
    });
});

function deletePost(postId) {
    fetch('/delete_post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Post deletion failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting post:', error);
    });
}

document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', event => {
        event.stopPropagation();
        const postId = event.currentTarget.dataset.postId;
        confirmDelete(postId);
    });
});

function confirmDelete(postId) {
    if (confirm('Please confirm deletion.')) {
        deletePost(postId);
    }
}

document.querySelectorAll('.delete-project-button').forEach(button => {
    button.addEventListener('click', event => {
        event.stopPropagation();
        const projectId = event.currentTarget.dataset.projectId;
        confirmDeleteProject(projectId);
    });
});

function confirmDeleteProject(projectId) {
    if (confirm('Please confirm deletion. All tasks and events in this project will be deleted.')) {
        deleteProject(projectId);
    }
}

function deleteProject(projectId) {
    fetch('/delete_project', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            console.error('Project deletion failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting project:', error);
    });
}
