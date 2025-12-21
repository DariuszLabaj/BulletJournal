class BulletJournal {
    static JournalScreen = Object.freeze({
        BLANK: 'blank',
        OVERVIEW: 'overview',
        SETTINGS: 'settings',
        TODAYS_LOG: 'Todays_Log',
        TRANSITION: 'transition',
    })

    constructor(userData) {
        this._userData = userData;

        this._tick = 0;
        this._screen = BulletJournal.JournalScreen.BLANK;
        this._previousScreen = null;
        this._nextScreen = null;

        this._transition = 0;
        this._transitionSpeed = 0.01;

        this._ui = {
            toggleTheme: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            openTodayLog: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            importData: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            exportData: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            backButton: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            addTaskButton: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            removeTaskButton: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            prevMonth: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            nextMonth: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
            setTaskStatusModel: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
        };

        this._zones = {
            daysHeader: { x: 0, y: 0, w: 0, h: 0 },
            taskLabels: { x: 0, y: 0, w: 0, h: 0 },
        };

        this._touch = {
            active: false,
            startX: 0,
            startY: 0,
            scrollMode: null,
            cell: {
                day: null,
                taskID: null,
                startTime: 0
            }
        };

        this._scroll = {
            x: 0,
            y: 0,
            maxX: 0,
            maxY: 0,
            speed: 40
        };

        this._showData = null;

        this._transitionTo(BulletJournal.JournalScreen.OVERVIEW);
    }

    _setScreen(newScreen) {
        this._screen = newScreen;
        this._tick = 0;
        this._transition = 0;
        this._previousScreen = null;
        this._nextScreen = null;
    }

    _transitionTo(screen) {
        if (this._screen === BulletJournal.JournalScreen.TRANSITION) return;
        if (screen === this._screen) return;

        this._previousScreen = this._screen;
        this._nextScreen = screen;
        this._screen = BulletJournal.JournalScreen.TRANSITION;
        this._transition = 0;
    }

    _updateTransition() {
        this._transition += this._transitionSpeed;
        if (this._transition >= 1) {
            this._setScreen(this._nextScreen);
        }
    }

    draw() {
        push();
        background(getCSSVariable('--background'));

        if (this._screen === BulletJournal.JournalScreen.TRANSITION) {
            this._updateTransition();
            this._drawTransition();
        } else {
            this._drawScreenContent(this._screen);
        }

        this._tick++;
        pop();
    }

    _drawScreenContent(screen) {
        switch (screen) {
            case BulletJournal.JournalScreen.OVERVIEW:
                this._drawOverview();
                break;
            case BulletJournal.JournalScreen.TODAYS_LOG:
                this._drawTasksView();
                break;
        }
    }

    _drawOverview() {
        this._drawMainHeader();

        const btnH = 40;
        const btnW = 160;
        const spacing = 10;
        const centerX = width / 2;
        const startY = height / 2 - btnH;

        noStroke();
        this._ui.openTodayLog = drawButton(centerX, startY, btnW, btnH, "Journal");
        this._ui.importData = drawButton(centerX, startY + btnH + spacing, btnW, btnH, "Import");
        this._ui.exportData = drawButton(centerX, startY + 2 * btnH + 2 * spacing, btnW, btnH, "Export");
    }

    _drawMainHeader() {
        fill(getCSSVariable('--on-background'));
        textSize(32);
        textAlign(LEFT, TOP);
        text(`Hi ${this._userData.name || 'Guest'}!`, 10, 10);

        push();
        textFont(materialFont);
        const icon = document.body.className === DARK ? "light_mode" : "dark_mode";
        this._ui.toggleTheme = drawButton(width - 30, 30, 40, 40, icon);
        pop();
    }

    _drawTasksView() {
        if (!this._showData) return;

        const padding = 30;
        const x = padding;
        const y = 50;
        const w = width - padding * 2;
        const h = height - y - padding;
        this._drawTasksGrid(x, y, w, h, isVertical());
    }

    _drawTasksGrid(x, y, w, h, vertical) {
        const CELL = 70;
        const HEADER = 300;

        push();
        noStroke();

        push();
        textFont(materialFont);
        this._ui.backButton = drawButton(width - 30, 30, 40, 40, 'home');
        this._ui.prevMonth = drawButton(width / 2 - 60, 30, 40, 40, 'chevron_left');
        this._ui.nextMonth = drawButton(width / 2 + 60, 30, 40, 40, 'chevron_right');
        pop();

        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(x, y, w, h);
        drawingContext.clip();

        const config = {
            x, y, w, h, CELL, HEADER, tasks: this._showData.tasks, grid: this._showData.grid, year: this._showData.year, month: this._showData.month
        }

        vertical ? this._drawVerticalGrid(config) : this._drawHorizontalGrid(config);

        drawingContext.restore();
        pop();
    }

    _drawTransition() {
        const c = color(getCSSVariable('--background'));

        if (this._transition < 0.5) {
            this._drawScreenContent(this._previousScreen);
            c.setAlpha(map(this._transition, 0, 0.5, 0, 255))
        }
        else {
            this._drawScreenContent(this._nextScreen);
            c.setAlpha(max(map(this._transition, 0.5, 1, 255, 0), 0))
        }

        fill(c);
        rect(0, 0, width, height);
    }

    /* ───────────────────────── TODO ────────────────────────────── */

    // TODO:
    // - Replace prompt() modals with in-canvas UI
    // - Extract grid rendering into reusable components
    // - Add task status modal (long-press)
    // - Keyboard navigation
    // - Undo / redo
    // - Accessibility (contrast, font scaling)
    // - Autosave indicator

    _drawVerticalGrid(config) {
        const { x, y, w, h, CELL, HEADER, tasks, grid, year, month } = config
        const NO_OF_DAYS = Object.keys(grid).length;
        this._zones.daysHeader = { x: x, y: y + HEADER, w: CELL, h: CELL * NO_OF_DAYS };
        this._zones.taskLabels = { x: x + CELL, y: y, w: CELL * tasks.length, h: HEADER };
        const showDate = new Date(year, month - 1, 1);
        const today = new Date();
        const total_width = CELL + CELL * tasks.length;
        const total_height = HEADER + CELL * NO_OF_DAYS;
        fill(getCSSVariable('--on-background'));
        textAlign(CENTER, CENTER);
        textSize(24);
        // Month Name Header
        push();
        textSize(32);
        rectMode(CENTER);
        translate(x + CELL / 2, y + HEADER / 2);
        rotate(-PI / 2);
        text(showDate.toLocaleDateString(this._userData.locale, { month: 'long', year: 'numeric' }), 0, 0, HEADER, CELL);
        pop();

        // Names of the Tasks (X Axis)
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(x + CELL - 2, y, w - CELL - 4, h);
        drawingContext.clip();
        push();
        translate(-this._scroll.x, 0);
        fill(getCSSVariable('--surface-container-lowest'));
        tasks.forEach((t, i) => {
            push();
            translate(x + (1.5 + i) * CELL, y + HEADER / 2);
            rotate(-PI / 2);
            rectMode(CENTER);
            fill(getCSSVariable('--on-background'));
            text(t.label, 0, 0, HEADER, CELL);
            pop();
            rect(x + (i + 2) * CELL - 2, y, 4, total_height, 2);
        });
        // Draw Add Remove Tasks Buttons
        push();
        textFont(materialFont);
        this._ui.addTaskButton = drawButton(x + 1.5 * CELL + CELL * tasks.length, y + HEADER / 3, 40, 40, 'add', this._scroll.x, 0);
        this._ui.removeTaskButton = drawButton(x + 1.5 * CELL + CELL * tasks.length, y + HEADER / 3 * 2, 40, 40, 'remove', this._scroll.x, 0);
        pop();
        pop();
        drawingContext.restore();
        fill(getCSSVariable('--surface-container-lowest'));
        rect(x + CELL - 2, y, 4, h, 2);

        // Names of the Days (Y Axis)
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(x, y + HEADER - 2, total_width, total_height - HEADER - 4);
        drawingContext.clip();
        fill(getCSSVariable('--surface-container-lowest'));
        rect(x, y + HEADER - 2, total_width, 4, 2);
        push();
        translate(0, -this._scroll.y);
        for (const d in grid) {
            const day = new Date(year, month - 1, d);
            const rowText = `${d.toString().padStart(2, '0')}\n${day.toLocaleString("pl-PL", { weekday: 'short' })}`;
            const y_offset = y + (d - 1) * CELL + HEADER;
            const weekend = [0, 6].includes(day.getDay());
            if (day.toDateString() === today.toDateString()) {
                fill(getCSSVariable('--tertiary-container'));
                rect(x + 2, y_offset + 2, CELL - 4, CELL - 4, 8);
                fill(getCSSVariable('--on-tertiary-container'));
                text(rowText, x + CELL / 2, y_offset + CELL / 2);
            } else if (weekend) {
                fill(getCSSVariable('--primary-container'));
                rect(x + 2, y_offset + 2, CELL - 4, CELL - 4, 8);
                fill(getCSSVariable('--on-primary-container'));
                text(rowText, x + CELL / 2, y_offset + CELL / 2);
            } else {
                fill(getCSSVariable('--on-background'));
                text(rowText, x + CELL / 2, y_offset + CELL / 2);
            }
            push();
            tasks.forEach((task, i) => {
                fill(getCSSVariable('--tertiary-fixed-dim'));
                const value = grid[d]?.[task.id] ?? 0;
                const padding = 10;
                const cellX = x + (1 + i) * CELL + padding;
                if (value > 0) {
                    const fillH = map(value, 0, 100, 0, CELL - 2 * padding)
                    rect(cellX, y_offset + padding, CELL - 2 * padding, fillH, padding / 2)
                }
            });
            pop();
            fill(getCSSVariable('--surface-container-lowest'));
            rect(x, y_offset - 2 + CELL, total_width, 4, 2);
        }
        pop();
        drawingContext.restore();
        this._scroll.maxX = max(0, CELL * (tasks.length + 1) - w + CELL);
        this._scroll.maxY = max(0, CELL * (NO_OF_DAYS + 1) - h + HEADER);
    }

    _drawHorizontalGrid(config) {
        const { x, y, w, h, CELL, HEADER, tasks, grid, year, month } = config
        const NO_OF_DAYS = Object.keys(grid).length;
        this._zones.daysHeader = { x: x + HEADER, y: y, w: CELL * NO_OF_DAYS, h: CELL };
        this._zones.taskLabels = { x: x, y: y + CELL, w: HEADER, h: CELL * tasks.length };
        const showDate = new Date(year, month - 1, 1);
        const today = new Date();
        const total_height = CELL + CELL * tasks.length;
        const total_width = HEADER + CELL * NO_OF_DAYS;
        fill(getCSSVariable('--on-background'));
        textAlign(CENTER, CENTER);
        textSize(24);
        // Month Name Header
        push();
        textSize(32);
        rectMode(CENTER);
        text(showDate.toLocaleDateString(this._userData.locale, { month: 'long', year: 'numeric' }), x + HEADER / 2, y + CELL / 2, HEADER, CELL);
        pop();
        // Names of the Tasks (Y Axis)
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(x, y + CELL - 2, w, h - CELL / 2 + 4);
        drawingContext.clip();
        push();
        translate(0, -this._scroll.y);
        fill(getCSSVariable('--surface-container-lowest'));
        tasks.forEach((t, i) => {
            push();
            rectMode(CENTER);
            fill(getCSSVariable('--on-background'));
            text(t.label, x + HEADER / 2, y + (1.5 + i) * CELL, HEADER, CELL);
            pop();
            rect(x, y + (i + 2) * CELL - 2, w, 4, 2);
        })
        // Draw Add Remove Tasks Buttons
        push();
        textFont(materialFont);
        this._ui.addTaskButton = drawButton(x + HEADER / 3, y + 1.5 * CELL + CELL * tasks.length, 40, 40, 'add', 0, this._scroll.y);
        this._ui.removeTaskButton = drawButton(x + HEADER / 3 * 2, y + 1.5 * CELL + CELL * tasks.length, 40, 40, 'remove', 0, this._scroll.y);
        pop();
        pop();
        drawingContext.restore();
        fill(getCSSVariable('--surface-container-lowest'));
        rect(x, y + CELL - 2, w, 4, 2);
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(x + HEADER, y, total_width, h);
        drawingContext.clip();
        push();
        translate(-this._scroll.x, 0);
        for (const d in grid) {
            const day = new Date(year, month - 1, d);
            const columnText = `${d.toString().padStart(2, '0')}\n${day.toLocaleString("pl-PL", { weekday: 'short' })}`;
            const x_offset = x + (d - 1) * CELL + HEADER;
            const weekend = [0, 6].includes(day.getDay());
            if (day.toDateString() === today.toDateString()) {
                fill(getCSSVariable('--tertiary-container'));
                rect(x_offset, y, CELL, CELL, 8);
                fill(getCSSVariable('--on-tertiary-container'));
                text(columnText, x_offset + CELL / 2, y + CELL / 2);
            } else if (weekend) {
                fill(getCSSVariable('--primary-container'));
                rect(x_offset, y, CELL, CELL, 8);
                fill(getCSSVariable('--on-primary-container'));
                text(columnText, x_offset + CELL / 2, y + CELL / 2);
            } else {
                fill(getCSSVariable('--on-background'));
                text(columnText, x_offset + CELL / 2, y + CELL / 2);
            }
            push();
            tasks.forEach((task, i) => {
                fill(getCSSVariable('--tertiary-fixed-dim'));
                const value = grid[d]?.[task.id] ?? 0;
                const padding = 10;
                const cellY = y + (1 + i) * CELL + padding;
                if (value > 0) {
                    const fillH = map(value, 0, 100, 0, CELL - 2 * padding)
                    rect(x_offset + padding, cellY, fillH, CELL - 2 * padding, padding / 2)
                }
            });
            pop();
            fill(getCSSVariable('--surface-container-lowest'));
            rect(x_offset - 2 + CELL, y, 4, total_height, 2);
        }
        pop();
        rect(x + HEADER, y, 4, h, 2);
        drawingContext.restore();
        this._scroll.maxX = max(0, CELL * (NO_OF_DAYS + 1) - w + HEADER);
        this._scroll.maxY = max(0, CELL * (tasks.length + 1) - h + CELL);
    }


    touchStarted(pos_x, pos_y) {
        switch (this._screen) {
            case BulletJournal.JournalScreen.OVERVIEW:
                // (pointInRect(x, y, debugYesPressed.bounds))
                if (pointInRect(pos_x, pos_y, this._ui.openTodayLog.bounds)) {
                    const now = new Date();
                    this._showData = this._userData.loadMonth(
                        now.getFullYear(),
                        now.getMonth() + 1
                    );
                    this._showData.day = now.getDate();
                    this._transitionTo(BulletJournal.JournalScreen.TODAYS_LOG);
                }
                if (pointInRect(pos_x, pos_y, this._ui.toggleTheme.bounds)) toggleTheme();
                if (pointInRect(pos_x, pos_y, this._ui.importData.bounds)) {
                    // TODO: reuse hidden file input instead of recreating
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = e => {
                        const reader = new FileReader();
                        reader.onload = () => this._userData.import(reader.result);
                        reader.readAsText(e.target.files[0]);
                    };
                    input.click();
                }
                if (pointInRect(pos_x, pos_y, this._ui.exportData.bounds)) {
                    // TODO: reuse hidden anchor element
                    const blob = new Blob([this._userData.export()], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'bullet-journal.json';
                    a.click();
                }
                break;
            case BulletJournal.JournalScreen.TODAYS_LOG:
                if (pointInRect(pos_x, pos_y, this._ui.backButton.bounds)) {
                    this._transitionTo(BulletJournal.JournalScreen.OVERVIEW);
                }
                if (pointInRect(pos_x, pos_y, this._ui.prevMonth.bounds) || pointInRect(pos_x, pos_y, this._ui.nextMonth.bounds)) {
                    const delta = pointInRect(pos_x, pos_y, this._ui.prevMonth.bounds) ? -1 : 1;
                    let { year, month } = this._showData;

                    month += delta;
                    if (month === 0) { month = 12; year--; }
                    if (month === 13) { month = 1; year++; }

                    this._showData = this._userData.loadMonth(year, month);
                    this._scroll.x = this._scroll.y = 0;
                }
                if (pointInRect(pos_x, pos_y, this._ui.addTaskButton.bounds)) {
                    const label = prompt("New task name:");
                    if (label) {
                        this._userData.addTask(
                            this._showData.year,
                            this._showData.month,
                            label
                        );
                        this._showData = this._userData.loadMonth(this._showData.year, this._showData.month);
                    }
                }
                if (pointInRect(pos_x, pos_y, this._ui.removeTaskButton.bounds)) {
                    const list = this._showData.tasks.map(t => `${t.id}:${t.label}`).join('\n');
                    const id = prompt(`Remove task (enter ID):\n${list}`);
                    if (id) {
                        this._userData.removeTask(this._showData.year, this._showData.month, id);
                        this._showData = this._userData.loadMonth(this._showData.year, this._showData.month);
                    }
                }
                break;
        }
        this._touch.active = true;
        this._touch.startX = pos_x;
        this._touch.startY = pos_y;
    
        if (this._pointInZone(pos_x, pos_y, this._zones.daysHeader)) {
            this._touch.scrollMode = 'days';
        }
        else if (this._pointInZone(pos_x, pos_y, this._zones.taskLabels)) {
            this._touch.scrollMode = 'tasks';
        }
        else {
            // Todo Determinate Task id adn day by touch position with relation of scroll
            const cell = this._getCellFromPosition(pos_x, pos_y);
            if (cell) {
                this._touch.cell.day = cell.day;
                this._touch.cell.taskID = cell.taskID;
                this._touch.cell.startTime = millis();
            }
            this._touch.scrollMode = null;
        }
    }
    _pointInZone(x, y, z) {
        return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
    }
    _getCellFromPosition(x, y) {
        const CELL = 70;
        const HEADER = 300;
        if (!this._showData) return null;
        const dayIndex = isVertical()
            ? Math.floor((y - HEADER - 50 + this._scroll.y) / CELL) + 1
            : Math.floor((x - HEADER - 30 + this._scroll.x) / CELL) + 1;
        const taskIndex = isVertical()
            ? Math.floor((x - CELL - 30 + this._scroll.x) / CELL)
            : Math.floor((y - CELL - 50 + this._scroll.y) / CELL);
        const task = this._showData.tasks[taskIndex];
        if (!task || dayIndex < 1 || dayIndex > this._showData.daysInMonth) {
            return null;
        }
        return { day: dayIndex, taskID: task.id };
    }
    touchMoved(pos_x, pos_y) {
        if (!this._touch.active || !this._touch.scrollMode) return;

        const dx = pos_x - this._touch.startX;
        const dy = pos_y - this._touch.startY;

        if (this._touch.scrollMode === 'days') {
            isVertical()
                ? this._scroll.y = constrain(this._scroll.y - dy, 0, this._scroll.maxY)
                : this._scroll.x = constrain(this._scroll.x - dx, 0, this._scroll.maxX);
        }
        if (this._touch.scrollMode === 'tasks') {
            isVertical()
                ? this._scroll.x = constrain(this._scroll.x - dx, 0, this._scroll.maxX)
                : this._scroll.y = constrain(this._scroll.y - dy, 0, this._scroll.maxY);
        }
        this._touch.startX = pos_x;
        this._touch.startY = pos_y;
    }
    touchEnded(pos_x, pos_y) {
        this._touch.active = false;
        this._touch.scrollMode = null;

        const cell = this._touch.cell;
        if (!cell.day || !cell.taskID) return;

        const duration = millis() - cell.startTime;

        if (duration < 300) {
            const current = this._showData.grid[cell.day]?.[cell.taskID] ?? 0;
            const value = current > 0 ? 0 : 100;
            this._userData.setDayValue(this._showData.year, this._showData.month, cell.day, cell.taskID, value);
            this._showData = this._userData.loadMonth(this._showData.year, this._showData.month);
        } else {
            this._ui.setTaskStatusModel = true;
            this._ui.selectedCell = cell;
        }
    }
}