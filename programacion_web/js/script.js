document.addEventListener('DOMContentLoaded', () => {
    const calendarAnnual = document.getElementById('calendarAnnual');
    const calendarMonthly = document.getElementById('calendarMonthly');
    const calendarDaily = document.getElementById('calendarDaily');
    const eventForm = document.getElementById('eventForm');
    const addEventForm = document.getElementById('addEventForm');
    const deleteEventButton = document.getElementById('deleteEvent');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const currentMonthLabel = document.getElementById('currentMonthLabel');
    const calendarDays = document.getElementById('calendarDays');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let currentDay = new Date().getDate();
    let selectedDate = new Date();
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let editingEventIndex = null;

    const renderAnnualCalendar = () => {
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        calendarAnnual.innerHTML = '';

        months.forEach((month, index) => {
            const monthDiv = document.createElement('div');
            monthDiv.textContent = month;

            const monthEvents = events.filter(event => new Date(event.date).getMonth() === index && new Date(event.date).getFullYear() === currentYear);
            if (monthEvents.length > 0) {
                const eventIndicator = document.createElement('span');
                eventIndicator.textContent = ` (${monthEvents.length})`;
                monthDiv.appendChild(eventIndicator);
            }

            monthDiv.addEventListener('click', () => {
                currentMonth = index;
                renderMonthlyCalendar();
                switchToView('monthly');
            });
            calendarAnnual.appendChild(monthDiv);
        });
    };

    const renderMonthlyCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const firstDayIndex = firstDay.getDay();
        const lastDayIndex = lastDay.getDate();

        calendarDays.innerHTML = '';

        currentMonthLabel.textContent = `${firstDay.toLocaleString('es-ES', { month: 'long' })} ${currentYear}`;

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            calendarDays.appendChild(emptyDiv);
        }

        for (let i = 1; i <= lastDayIndex; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;

            const dayEvents = events.filter(event => new Date(event.date).toDateString() === new Date(currentYear, currentMonth, i).toDateString());
            dayEvents.forEach((event, index) => {
                const eventDiv = document.createElement('div');
                eventDiv.textContent = event.description;
                eventDiv.classList.add('event');
                eventDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEventForm(new Date(currentYear, currentMonth, i), event.time, index);
                });
                dayDiv.appendChild(eventDiv);
            });

            dayDiv.addEventListener('click', () => openEventForm(new Date(currentYear, currentMonth, i)));
            calendarDays.appendChild(dayDiv);
        }
    };

    const renderDailyCalendar = () => {
        calendarDaily.innerHTML = '';

        for (let i = 0; i < 24; i++) {
            const hourDiv = document.createElement('div');
            hourDiv.classList.add('hour');
            hourDiv.textContent = `${i}:00`;

            const hourEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth && eventDate.getDate() === currentDay && event.time.split(':')[0] == i;
            });
            hourEvents.forEach((event, index) => {
                const eventDiv = document.createElement('div');
                eventDiv.textContent = event.description;
                eventDiv.classList.add('event');
                eventDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEventForm(new Date(currentYear, currentMonth, currentDay), event.time, index);
                });
                hourDiv.appendChild(eventDiv);
            });

            hourDiv.addEventListener('click', () => openEventForm(new Date(currentYear, currentMonth, currentDay), `${i}:00`));
            calendarDaily.appendChild(hourDiv);
        }
    };

    const switchToView = (view) => {
        calendarAnnual.style.display = 'none';
        calendarMonthly.style.display = 'none';
        calendarDaily.style.display = 'none';

        if (view === 'annual') {
            calendarAnnual.style.display = 'grid';
        } else if (view === 'monthly') {
            calendarMonthly.style.display = 'grid';
        } else if (view === 'daily') {
            calendarDaily.style.display = 'grid';
        }
    };

    const openEventForm = (date, time = null, eventIndex = null) => {
        selectedDate = date;
        if (time) {
            document.getElementById('eventTime').value = time;
        }
        if (eventIndex !== null) {
            editingEventIndex = eventIndex;
            const event = events[eventIndex];
            document.getElementById('formTitle').textContent = "Editar Evento";
            document.getElementById('eventTime').value = event.time;
            document.getElementById('eventDescription').value = event.description;
            document.getElementById('eventParticipants').value = event.participants;
            deleteEventButton.style.display = 'block';
        } else {
            editingEventIndex = null;
            document.getElementById('formTitle').textContent = "Nuevo Evento";
            addEventForm.reset();
            deleteEventButton.style.display = 'none';
        }
        eventForm.style.display = 'block';
    };

    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventTime = document.getElementById('eventTime').value;
        const eventDescription = document.getElementById('eventDescription').value;
        const eventParticipants = document.getElementById('eventParticipants').value;

        const event = {
            date: selectedDate.toISOString(),
            time: eventTime,
            description: eventDescription,
            participants: eventParticipants
        };

        if (editingEventIndex !== null) {
            events[editingEventIndex] = event;
        } else {
            events.push(event);
        }

        localStorage.setItem('events', JSON.stringify(events));

        eventForm.style.display = 'none';
        renderAnnualCalendar();
        renderMonthlyCalendar();
        renderDailyCalendar();
    });

    deleteEventButton.addEventListener('click', () => {
        if (editingEventIndex !== null) {
            events.splice(editingEventIndex, 1);
            localStorage.setItem('events', JSON.stringify(events));
            eventForm.style.display = 'none';
            renderAnnualCalendar();
            renderMonthlyCalendar();
            renderDailyCalendar();
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
        if (currentMonth === 11) {
            currentYear--;
        }
        renderMonthlyCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
        if (currentMonth === 0) {
            currentYear++;
        }
        renderMonthlyCalendar();
    });

    document.getElementById('annualViewBtn').addEventListener('click', () => switchToView('annual'));
    document.getElementById('monthlyViewBtn').addEventListener('click', () => switchToView('monthly'));
    document.getElementById('dailyViewBtn').addEventListener('click', () => switchToView('daily'));

    renderAnnualCalendar();
    renderMonthlyCalendar();
    renderDailyCalendar();
    switchToView('monthly');
});
