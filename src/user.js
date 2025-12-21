class UserData {
    static UserScene = Object.freeze({
        LOADING: 'blank',
        WELCOME: 'welcome',
        NEW_USER: 'new_user',
        GREETINGS: 'greetings',
        READY: 'ready',
        TRANSITION: 'transition',
    });
    static STORAGE_KEY = "userData";

    constructor() {
        this._tick = 0;
        this._transition = 0;
        this._transitionSpeed = 0.01;
        this._previousScene = null;
        this._nextScene = null;
        this._scene = UserData.UserScene.LOADING;

        this._name = '';
        this._preferences = {
            theme: getSystemTheme(),
            notifications: true,
        };
        this._lastLogin = null;

        this._ui = {
            activeField: 'name',
            nameBuffer: '',
            buttonHover: { bounds: {x: -100, y: -100, w: -100, h: -100}, isHover: false},
        };

        this._bulletJournal = [];
        this._bulletTasks = [];
        this._locale =
            navigator.language ||
            navigator.userLanguage ||
            navigator.browserLanguage;
        this._hiddenInput = null;
    }

    initInput() {
        this._hiddenInput = createInput('');
        this._hiddenInput.position(-1000, -1000); // hide it
        this._hiddenInput.input(() => {
            if (this._ui.activeField === 'name') {
                this._ui.nameBuffer = this._hiddenInput.value();
            }
        });
        this._hiddenInput.elt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this._confirmNewUser();
                this._hiddenInput.elt.blur(); // lose focus after confirming
            }
        });
    }

    get name() { return this._name; }
    get preferences() { return this._preferences; }
    get lastLogin() { return this._lastLogin; }
    get scene() { return this._scene; }
    get locale() { return this._locale; }

    _monthId(year, month) { return `${year}-${String(month).padStart(2, '0')}`; }

    _daysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

    _findMonthEntry(year, month) {
        const id = this._monthId(year, month);
        return this._bulletJournal.find(e => e.id === id);
    }

    _hasTaskInAnyMonth(taskId) {
        return this._bulletJournal.some(entry => entry.tasks.includes(taskId));
    }

    findPreviousMonth(year, month) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        return this._findMonthEntry(prevYear, prevMonth);
    }

    createMonthEntry(year, month) {
        const id = this._monthId(year, month);
        const days = this._daysInMonth(year, month);

        const prev = this.findPreviousMonth(year, month);
        const tasks = prev ? [...prev.tasks] : [];

        const grid = {};
        for (let d = 1; d <= days; d++) {
            grid[d] = {};
        }
        const entry = { id, tasks, grid };
        this._bulletJournal.push(entry);
        this.save();

        return entry;
    }


    loadMonth(year, month) {
        let entry = this._findMonthEntry(year, month);
        if (!entry) {
            entry = this.createMonthEntry(year, month);
        }

        return {
            year,
            month,
            daysInMonth: this._daysInMonth(year, month),
            tasks: entry.tasks
                .map(id => this._bulletTasks.find(t => t.id == id))
                .filter(Boolean),
            grid: entry.grid,
            _entry: entry,
        }
    }

    async load() {
        const raw = localStorage.getItem(UserData.STORAGE_KEY);
        if (!raw) {
            this._setScene(UserData.UserScene.WELCOME);
            return;
        }
        const data = JSON.parse(raw);

        this._name = data.name ?? '';
        this._preferences = data.preferences ?? this._preferences;
        this._lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;

        this._bulletJournal = data.bulletJournal ?? [];
        this._bulletTasks = data.bulletTasks ?? [];

        applyTheme(this._preferences.theme);

        this._setScene(UserData.UserScene.GREETINGS);
        this.updateLastLogin();
    }

    async save() {
        localStorage.setItem(
            UserData.STORAGE_KEY,
            JSON.stringify(
                {
                    name: this._name,
                    preferences: this._preferences,
                    lastLogin: this._lastLogin,
                    bulletJournal: this._bulletJournal,
                    bulletTasks: this._bulletTasks,
                })
        );
    }

    updateLastLogin() {
        this._lastLogin = new Date();
        this.save();
    }

    _setScene(scene) {
        this._scene = scene;
        this._tick = 0;
        this._transition = 0;
        this._nextScene = null;
        this._previousScene = null;
    }

    _transitionTo(scene) {
        if (this._scene === UserData.UserScene.TRANSITION) return;
        if (scene === this._scene) return;

        this._previousScene = this._scene;
        this._nextScene = scene;
        this._scene = UserData.UserScene.TRANSITION;
        this._transition = 0;
    }

    _updateTransition() {
        this._transition += this._transitionSpeed;
        if (this._transition >= 1) {
            this._setScene(this._nextScene);
        }
    }

    draw() {
        push();
        background(getCSSVariable('--background'));
        if (this._scene === UserData.UserScene.TRANSITION) {
            this._updateTransition();
            this._drawTransition();
        } else {
            this._drawSceneContent(this._scene);
        }
        this._tick++;
        pop();
    }

    _drawSceneContent(scene) {
        switch (scene) {
            case UserData.UserScene.LOADING:
                this._centerText('Loading user data...');
                break;
            case UserData.UserScene.WELCOME:
                this._drawWelcomeNewUser();
                break;
            case UserData.UserScene.NEW_USER:
                this._drawNewUserSetup();
                break;
            case UserData.UserScene.GREETINGS:
                this._drawGreetings();
                break;
            case UserData.UserScene.READY:
                break;
        }
    }

    _drawWelcomeNewUser() {
        this._centerText("Welcome! Let's create your profile.");
        if (this._tick >= 60) {
            this._transitionTo(UserData.UserScene.NEW_USER);
        }
    }

    _drawNewUserSetup() {
        // User Ui
        const centerX = width / 2;
        const startY = height / 2 - 60;
        const fieldWidth = 300;
        const fieldHeight = 40;

        fill(getCSSVariable('--primary-container'));
        noStroke();
        rect(centerX - fieldWidth / 2 - 40, startY - 100, fieldWidth + 80, 260, 10);

        textAlign(CENTER, CENTER);
        fill(getCSSVariable('--on-background'));
        SetFontSize(28);
        text("Set Up Your Profile", centerX, startY - 50);

        this._hiddenInput.value(this._ui.nameBuffer);

        drawInputField(centerX - fieldWidth / 2,
            startY,
            fieldWidth,
            fieldHeight,
            this._ui.nameBuffer,
            'Name',
            this._ui.activeField === 'name'
        );

        this._ui.buttonHover = drawButton(centerX, startY + 100, 150, 50, "Continue");
    }

    _drawGreetings() {
        this._centerText(`Welcome back, ${this._name || 'User'}!`);
        if (this._tick >= 60) {
            this._transitionTo(UserData.UserScene.READY);
        }
    }

    _drawTransition() {
        const c = color(getCSSVariable('--background'));
        if (this._transition < 0.5) {
            this._drawSceneContent(this._previousScene);
            const alpha = map(this._transition, 0, 0.5, 0, 255);
            c.setAlpha(alpha)
            fill(c);
        }
        else {
            this._drawSceneContent(this._nextScene);
            const alpha = max(map(this._transition, 0.5, 1, 255, 0), 0);
            c.setAlpha(alpha)
            fill(c);
        }
        rect(0, 0, width, height);
    }

    _centerText(txt) {
        fill(getCSSVariable('--on-background'));
        textAlign(CENTER, CENTER);
        textSize(28);
        text(txt, width / 2, height / 2);
    }

    mousePressed(pos_x, pos_y) {
        if (this._scene !== UserData.UserScene.NEW_USER) return;

        const centerX = width / 2;
        const startY = height / 2 - 60;
        const fieldWidth = 300;
        const fieldHeight = 40;

        const nameRect = {
            x: centerX - fieldWidth / 2,
            y: startY,
            w: fieldWidth,
            h: fieldHeight,
        };

        if (pointInRect(pos_x, pos_y, nameRect)) {
            this._ui.activeField = 'name';
            this._hiddenInput.elt.focus();
        } else {
            // Clicked outside: lose focus
            this._ui.activeField = null;
            this._hiddenInput.elt.blur();
        }

        if (pointInRect(this._ui.buttonHover.bounds)) {
            this._confirmNewUser();
        }

    }

    keyPressed(key) {
        if (this._scene !== UserData.UserScene.NEW_USER) return;
        if (!this._ui.activeField) return;

        if (key === 'Backspace') {
            this._ui.nameBuffer = this._ui.nameBuffer.slice(0, -1);
        } else if (key === 'Enter') {
            this._confirmNewUser();
            this._hiddenInput.elt.blur();
        }
        else if (key.length === 1) {
            this._ui.nameBuffer += key;
        }
        this._hiddenInput.value(this._ui.nameBuffer);
    }

    _confirmNewUser() {
        if (!this._ui.nameBuffer.trim()) return;

        this._name = this._ui.nameBuffer.trim();
        this.updateLastLogin();
        this.save();

        this._transitionTo(UserData.UserScene.GREETINGS);
    }

    _createUniqueTaskId() {
        if (this._bulletTasks.length === 0) return 1;
        const maxId = Math.max(...this._bulletTasks.map(t => t.id));
        return maxId + 1;
    }

    addTask(year, month, label) {
        const task = {
            id: this._createUniqueTaskId(),
            label
        };

        this._bulletTasks.push(task);

        const entry = this._findMonthEntry(year, month);
        if (entry && !entry.tasks.includes(task.id)) {
            entry.tasks.push(task.id);
        }

        this.save();
        return task;
    }

    removeTask(year, month, taskId) {
        const entry = this._findMonthEntry(year, month);
        if (!entry) return;

        entry.tasks = entry.tasks.filter(id => id != taskId);

        for (const day in entry.grid) {
            delete entry.grid[day][taskId];
        }

        if (!this._hasTaskInAnyMonth(taskId)) {
            this._bulletTasks = this._bulletTasks.filter(t => t.id != taskId);
        }

        this.save();
    }

    setDayValue(year, month, day, taskId, value) {
        const entry = this._findMonthEntry(year, month);
        if (!entry) return;

        if (!entry.grid[day]) entry.grid[day] = {};
        entry.grid[day][taskId] = value;

        this.save();
    }

    export() {
        return JSON.stringify({
            bulletJournal: this._bulletJournal,
            bulletTasks: this._bulletTasks
        }, null, 2);
    }

    import(json) {
        const data = JSON.parse(json);
        this._bulletJournal = data.bulletJournal ?? [];
        this._bulletTasks = data.bulletTasks ?? [];
        this.save();
    }
}