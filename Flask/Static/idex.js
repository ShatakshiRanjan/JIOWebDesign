document.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('mouseover', event => {
        const taskDetails = event.currentTarget.dataset;

        const formatDate = (dateString) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, options);
        };

        const formatTime = (timeString) => {
            const [hours, minutes] = timeString.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes);
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        const formatDateTime = (dateTimeString) => {
            const [date, time] = dateTimeString.split(' ');
            return `${formatDate(date)} at ${formatTime(time)}`;
        };

        document.getElementById('details-task').textContent = taskDetails.task;
        document.getElementById('details-start-date').textContent = formatDate(taskDetails.startDate);
        document.getElementById('details-start-time').textContent = formatTime(taskDetails.startTime);
        document.getElementById('details-end-date').textContent = formatDate(taskDetails.endDate);
        document.getElementById('details-end-time').textContent = formatTime(taskDetails.endTime);
        document.getElementById('details-dedicated-to').textContent = taskDetails.dedicatedTo;
        document.getElementById('details-description').textContent = taskDetails.description;
        document.getElementById('details-completion-date').textContent = formatDateTime(taskDetails.completionDate);
    });
});

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

document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', event => {
        event.stopPropagation();
        const taskId = event.currentTarget.parentElement.querySelector('input[type="checkbox"]').value;
        deleteTask(taskId);
    });
});

window.onload = function() {
    if (!sessionStorage.getItem('reloaded')) {
        sessionStorage.setItem('reloaded', 'yes');
        window.location.reload();
    } else {
        sessionStorage.removeItem('reloaded');
    }
};

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
    if (confirm('Are you sure you want to delete this post?')) {
        deletePost(postId);
    }
}
