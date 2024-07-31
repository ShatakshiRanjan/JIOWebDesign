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

document.addEventListener('click', function(event) {
    var dropdown = document.querySelector('.dropdown-checkbox-content');
    if (event.target.matches('.dropbtn')) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    } else if (!event.target.closest('.dropdown-checkbox')) {
        dropdown.style.display = 'none';
    }
});

function toggleFields() {
    var type = document.querySelector('input[name="type"]:checked').value;
    var nameGroup = document.getElementById('nameGroup');
    var descriptionGroup = document.getElementById('descriptionGroup');
    var projectGroup = document.getElementById('projectGroup');
    var dateGroup = document.getElementById('dateGroup');
    var timeGroup = document.getElementById('timeGroup');
    var startDateGroup = document.getElementById('startDateGroup');
    var endDateGroup = document.getElementById('endDateGroup');
    var assignedToGroup = document.getElementById('assignedToGroup');

    nameGroup.style.display = 'block';
    descriptionGroup.style.display = 'block';

    if (type === 'project') {
        projectGroup.style.display = 'none';
        dateGroup.style.display = 'none';
        timeGroup.style.display = 'none';
        startDateGroup.style.display = 'none';
        endDateGroup.style.display = 'none';
        assignedToGroup.style.display = 'none';
    } else if (type === 'event') {
        projectGroup.style.display = 'block';
        dateGroup.style.display = 'block';
        timeGroup.style.display = 'block';
        startDateGroup.style.display = 'none';
        endDateGroup.style.display = 'none';
        assignedToGroup.style.display = 'block';
    } else if (type === 'task') {
        projectGroup.style.display = 'block';
        dateGroup.style.display = 'none';
        timeGroup.style.display = 'none';
        startDateGroup.style.display = 'block';
        endDateGroup.style.display = 'block';
        assignedToGroup.style.display = 'block';
    }
}

document.getElementById('taskForm').addEventListener('submit', function(event) {
    var type = document.querySelector('input[name="type"]:checked').value;
    var startDate = document.getElementById('startDate').value;
    var startTime = document.getElementById('startTime').value;
    var endDate = document.getElementById('endDate').value;
    var endTime = document.getElementById('endTime').value;

    var startDateTime = new Date(startDate + 'T' + startTime);
    var endDateTime = new Date(endDate + 'T' + endTime);

    if (type === 'event' && startDateTime >= endDateTime) {
        event.preventDefault();
        document.getElementById('errorMessage').style.display = 'block';
    } else if (type === 'task' && endDateTime <= startDateTime) {
        event.preventDefault();
        document.getElementById('errorMessage').style.display = 'block';
    } else {
        document.getElementById('errorMessage').style.display = 'none';
    }
});

toggleFields();