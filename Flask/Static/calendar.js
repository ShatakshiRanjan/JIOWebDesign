
function openModal() {
  document.getElementById('task-details-modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
}

!function() {
    var today = moment();

    function Calendar(selector, events) {
        this.el = document.querySelector(selector);
        this.events = events.map(function(ev) {
            ev.date = moment(ev.date);
            return ev;
        });
        this.current = moment().date(1);
        this.draw();
        var current = document.querySelector('.today');
        if (current) {
            var self = this;
            window.setTimeout(function() {
                self.openDay(current);
            }, 500);
        }
    }

    Calendar.prototype.draw = function() {
        this.drawHeader();
        this.drawMonth();
        this.drawLegend();
    }

    Calendar.prototype.drawHeader = function() {
        var self = this;
        if (!this.header) {
            this.header = createElement('div', 'header');
            this.title = createElement('h1');

            var right = createElement('div', 'right');
            right.addEventListener('click', function() { self.nextMonth(); });

            var left = createElement('div', 'left');
            left.addEventListener('click', function() { self.prevMonth(); });

            this.header.appendChild(this.title); 
            this.header.appendChild(right);
            this.header.appendChild(left);
            this.el.appendChild(this.header);
        }

        this.title.innerHTML = this.current.format('MMMM YYYY');
    }

    Calendar.prototype.drawMonth = function() {
        var self = this;
        
        if (this.month) {
            this.oldMonth = this.month;
            this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
            this.oldMonth.addEventListener('webkitAnimationEnd', function() {
                self.oldMonth.parentNode.removeChild(self.oldMonth);
                self.month = createElement('div', 'month');
                self.backFill();
                self.currentMonth();
                self.forwardFill();
                self.el.appendChild(self.month);
                window.setTimeout(function() {
                    self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
                }, 16);
            });
        } else {
            this.month = createElement('div', 'month');
            this.el.appendChild(this.month);
            this.backFill();
            this.currentMonth();
            this.forwardFill();
            this.month.className = 'month new';
        }
    }

    Calendar.prototype.backFill = function() {
        var clone = this.current.clone();
        var dayOfWeek = clone.day();

        if (!dayOfWeek) return;

        clone.subtract(dayOfWeek + 1, 'days');

        for (var i = dayOfWeek; i > 0; i--) {
            this.drawDay(clone.add(1, 'days'));
        }
    }

    Calendar.prototype.forwardFill = function() {
        var clone = this.current.clone().add(1, 'months').subtract(1, 'days');
        var dayOfWeek = clone.day();

        if (dayOfWeek === 6) return;

        for (var i = dayOfWeek; i < 6; i++) {
            this.drawDay(clone.add(1, 'days'));
        }
    }

    Calendar.prototype.currentMonth = function() {
        var clone = this.current.clone();

        while (clone.month() === this.current.month()) {
            this.drawDay(clone);
            clone.add(1, 'days');
        }
    }

    Calendar.prototype.getWeek = function(day) {
        if (!this.week || day.day() === 0) {
            this.week = createElement('div', 'week');
            this.month.appendChild(this.week);
        }
    }

    Calendar.prototype.drawDay = function(day) {
        var self = this;
        this.getWeek(day);

        var outer = createElement('div', this.getDayClass(day));
        outer.addEventListener('click', function() {
            self.openDay(this);
        });

        var name = createElement('div', 'day-name', day.format('ddd'));
        var number = createElement('div', 'day-number', day.format('DD'));
        var events = createElement('div', 'day-events');
        this.drawEvents(day, events);

        outer.appendChild(name);
        outer.appendChild(number);
        outer.appendChild(events);
        this.week.appendChild(outer);
    }

    Calendar.prototype.drawEvents = function(day, element) {
        var todaysEvents = this.events.filter(function(ev) {
            return ev.date.isSame(day, 'day');
        });
        
        todaysEvents.forEach(function(ev) {
            var evSpan = createElement('span', ev.color);
            evSpan.setAttribute('title', ev.eventName);
            element.appendChild(evSpan);
        });
    }

    Calendar.prototype.getDayClass = function(day) {
        var classes = ['day'];
        if (day.month() !== this.current.month()) {
            classes.push('other');
        } else if (today.isSame(day, 'day')) {
            classes.push('today');
        }
        return classes.join(' ');
    }

    Calendar.prototype.openDay = function(el) {
        var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
        var day = this.current.clone().date(dayNumber);
        
        var currentOpened = document.querySelector('.details');

        // If the same day is clicked again, close the details
        if (currentOpened && currentOpened.getAttribute('data-date') === day.format('YYYY-MM-DD')) {
            currentOpened.addEventListener('animationend', function() {
                currentOpened.parentNode.removeChild(currentOpened);
            });
            currentOpened.className = 'details out';
            return;
        }

        // Remove any existing details
        if (currentOpened) {
            currentOpened.addEventListener('animationend', function() {
                currentOpened.parentNode.removeChild(currentOpened);
            });
            currentOpened.className = 'details out';
        }

        // Create new details element
        var details = createElement('div', 'details in');
        details.setAttribute('data-date', day.format('YYYY-MM-DD'));
        
        // var arrow = createElement('div', 'arrow');
        // details.appendChild(arrow);
        var todays_event_details = document.getElementById("todays-event-details");
        todays_event_details.appendChild(details);

        var todaysEvents = this.events.filter(function(ev) {
            return ev.date.isSame(day, 'day');
        });

        this.renderEvents(todaysEvents, details);
        // arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 45 + 'px';
    }

    Calendar.prototype.renderEvents = function(events, ele) {
        var currentWrapper = ele.querySelector('.events');
        var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

        events.forEach(function(ev) {
            var div = createElement('div', 'event');
            div.style.backgroundColor = 'white';
            div.style.color = 'black';
            div.style.borderRadius = '5px';
            div.style.cursor = 'pointer';
            div.style.margin = '5px';
            
            div.setAttribute('data-task', ev.task);
            div.setAttribute('data-dedicated-to', ev.dedicatedTo);
            div.setAttribute('data-description', ev.description);
            div.setAttribute('data-type', ev.type);
            div.setAttribute('data-due-date', ev.dueDate);
            div.setAttribute('data-due-time', ev.dueTime);
            div.setAttribute('data-start-date', ev.startDate);
            div.setAttribute('data-start-time', ev.startTime);
            div.setAttribute('data-end-date', ev.endDate);
            div.setAttribute('data-end-time', ev.endTime);
            div.setAttribute('data-completion-date', ev.completionDate);

            var square = createElement('div', 'event-category ' + ev.color);
            var span = createElement('span', '', ev.eventName);

            div.addEventListener('click', event => {
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

            div.appendChild(square);
            div.appendChild(span);
            wrapper.appendChild(div);
        });

        if (!events.length) {
            var div = createElement('div', 'event empty');
            var span = createElement('span', '', 'No Events');
            div.appendChild(span);
            wrapper.appendChild(div);
        }

        if (currentWrapper) {
            currentWrapper.className = 'events out';
            currentWrapper.addEventListener('animationend', function() {
                currentWrapper.parentNode.removeChild(currentWrapper);
                ele.appendChild(wrapper);
            });
        } else {
            ele.appendChild(wrapper);
        }
    }

    Calendar.prototype.drawLegend = function() {
        var legend = createElement('div', 'legend');
        var calendars = this.events.reduce(function(memo, e) {
            if (!memo[e.calendar]) {
                memo[e.calendar] = e.color;
            }
            return memo;
        }, {});

        for (var key in calendars) {
            var entry = createElement('span', 'entry ' + calendars[key], key);
            legend.appendChild(entry);
        }

        this.el.appendChild(legend);
    }

    Calendar.prototype.nextMonth = function() {
        this.current.add(1, 'months');
        this.next = true;
        this.draw();
    }

    Calendar.prototype.prevMonth = function() {
        this.current.subtract(1, 'months');
        this.next = false;
        this.draw();
    }

    window.Calendar = Calendar;

    function createElement(tagName, className, innerText) {
        var ele = document.createElement(tagName);
        if (className) {
            ele.className = className;
        }
        if (innerText) {
            ele.innerText = ele.textContent = innerText;
        }
        return ele;
    }
}();

document.addEventListener('DOMContentLoaded', function() {
    var events = JSON.parse('{{ events | tojson | safe }}');
    var calendar = new Calendar('#calendar', events);
});

