
document.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('mouseover', event => {
        const taskDetails = event.currentTarget.dataset;
        document.getElementById('details-task').textContent = taskDetails.task;
        document.getElementById('details-start-date').textContent = taskDetails.startDate;
        document.getElementById('details-start-time').textContent = taskDetails.startTime;
        document.getElementById('details-end-date').textContent = taskDetails.endDate;
        document.getElementById('details-end-time').textContent = taskDetails.endTime;
        //document.getElementById('details-dedicated-to').textContent = taskDetails.dedicatedTo;
        document.getElementById('details-description').textContent = taskDetails.description;
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

document.querySelectorAll('input[type="checkbox"]').forEach(item => {
    item.addEventListener('change', event => {
        if (!event.target.checked) {
            markIncomplete(event.target.value);
        }
    });
});

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
        event.stopPropagation(); // Prevent triggering other click events
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
