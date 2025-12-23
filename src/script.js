const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
let state = LOADING;
let loadingProgress = { value: 0 };
let progressBar;
let userData = new UserData();
let journal = new BulletJournal();

let debugConfirmActive = false;
let debugConfirmCallback = null;
let sfx = {};
let debugYesPressed = { bounds: { x: -100, y: -100, w: -100, h: -100 }, isHover: false };
let debugNoPressed = { bounds: { x: -100, y: -100, w: -100, h: -100 }, isHover: false };
let font;
let materialFont;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    sfx.toggle = await loadSound("assets\\sfx.wav");
    document.body.style.touchAction = 'none';
    progressBar = new ProgressBar(width / 2, height / 2, width * 0.6, 30);
    loadDataAsync(loadingProgress);
    userData.initInput();
}

function draw() {
    switch (state) {
        case LOADING:
            drawLoadingScreen();
            break;
        case NEW_USER_SETUP:
            userData.draw();
            if (userData.scene === UserData.UserScene.READY) {
                journal = new BulletJournal(userData, sfx);
                state = MAIN;
            }
            break;
        case MAIN:
            journal.draw();
            break;
        // other states...
    }
    drawDebugOverlay();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    switch (state) {
        case LOADING:
            progressBar.resize(width / 2, height / 2, width * 0.6, 30);
            break;
        // other states...
    }
}

function handleInputPress(x, y) {
    if (debugConfirmActive) {
        if (pointInRect(x, y, debugYesPressed.bounds)) {
            debugConfirmCallback?.();
            debugConfirmActive = false;
            debugConfirmCallback = null;
            return;
        }

        if (pointsInRect(x, y, debugNoPressed.bounds)) {
            debugConfirmActive = false;
            debugConfirmCallback = null;
            return;
        }

        return; // prevent clicks passing through
    }

    if (state === NEW_USER_SETUP) {
        userData.mousePressed(x, y);
    } else if (state === MAIN) {
        journal.touchStarted(x, y);
    }
}

function mousePressed() {
    handleInputPress(mouseX, mouseY);
    return false;
}

function touchStarted() {
    return false;
}

function mouseDragged() {
    if (state === MAIN && journal) {
        journal.touchMoved(mouseX, mouseY);
    }
    return false;
}


function touchMoved() {
    return false;
}

function mouseReleased() {
    if (state === MAIN && journal) {
        journal.touchEnded(mouseX, mouseY);
    }
    return false;
}

function touchEnded() {
    return false;
}

function keyPressed(event) {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        if (!debugConfirmActive) {
            debugConfirmActive = true;
            debugConfirmCallback = () => {
                console.warn('[DEBUG] Clearing ALL localStorage');
                localStorage.clear();
                userData = new UserData();
                userData.load();
                state = NEW_USER_SETUP;
                loadingProgress.value = 0;
            };
        }
        return; // prevent further handling
    }
    else if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() == 'e') {
        toggleTheme();
        return;
    }

    switch (state) {
        case NEW_USER_SETUP:
            userData.keyPressed(key);
            break;
        case MAIN:
            // journal.keyPressed(key);
            break;
    }
}

function drawLoadingScreen() {
    background(30);
    progressBar.text = "Loading... " + Math.floor(loadingProgress.value * 100) + "%";
    progressBar.draw(loadingProgress.value);
    if (loadingProgress.value >= 1) {
        state = NEW_USER_SETUP;
    }
}

async function loadDataAsync(progress) {
    total = 3;
    fulfilled = 0;
    const advance = () => {
        fulfilled++;
        progress.value = fulfilled / total;
    }

    const userDataPromise = Promise.resolve().then(() => userData.load()).then(advance);
    const fontPromise = loadFont("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap").then(f => { font = f; advance(); });
    const materialFontPromise = loadFont("assets\\MaterialSymbolsOutlined-VariableFont_FILL,GRAD,opsz,wght.ttf").then(f => { materialFont = f; advance(); });
    await Promise.all([userDataPromise, fontPromise, materialFontPromise]);
}

function toggleTheme() {
    const current = document.body.className;
    userData.preferences.theme = current === DARK ? LIGHT : DARK;
    userData.save();
    applyTheme(userData.preferences.theme);
}

function drawDebugOverlay() {
    if (!debugConfirmActive) return;

    push();
    fill(0, 180);
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("DEBUG: Clear ALL localStorage?", width / 2, height / 2 - 40);

    // Buttons
    const btnW = 120;
    const btnH = 40;
    const spacing = 20;
    const cx = width / 2;

    const yesX = cx - btnW - spacing / 2;
    const noX = cx + spacing / 2;
    const y = height / 2 + 20;

    debugYesPressed = drawButton(yesX + btnW / 2, y + btnH / 2, btnW, btnH, "YES");
    debugNoPressed = drawButton(noX + btnW / 2, y + btnH / 2, btnW, btnH, "NO");

    pop();
}