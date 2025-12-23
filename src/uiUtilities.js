let isVertical = a => height > width;

function SetFontSize(value){
  textSize(ptToPx(value));
}

function ptToPx(pt) {
  return pt * (96 / 72);
}

function toggleFullscreen() {
    let fs = fullscreen();
    fullscreen(!fs);
    if (!fs) {
        // entering fullscreen → enable wake lock
        enableWakeLock();
    } else {
        // exiting fullscreen → disable wake lock
        disableWakeLock();
    }
}

function drawInputField(x, y, w, h, value, placeholder, isActive) {
  push();
  stroke(isActive ? getCSSVariable('--outline-variant') : getCSSVariable('--outline'));
  fill(getCSSVariable('--surface'));//30);
  rect(x, y, w, h, 6);
  noStroke();
  fill(value ? getCSSVariable('--on-surface') : getCSSVariable("--on-surface-variant"));
  SetFontSize(16);
  textAlign(LEFT, CENTER);
  const textX = x + 10;
  const textY = y + h / 2;
  text(value || placeholder, textX, textY);
  pop();
}

function drawButton(cx, cy, w, h, label, x_offset = 0, y_offset = 0) {
  push();
  const x = cx - w / 2;
  const y = cy - h / 2 - 1;
  const bounds = {
    x: x - x_offset,
    y: y - y_offset,
    w: w,
    h: h,
  }
  const isHover = mouseX >= x - x_offset && mouseX <= x - x_offset + w && mouseY >= y - y_offset && mouseY <= y - y_offset + h;
  noStroke();
  fill(isHover ? getCSSVariable('--secondary') : getCSSVariable('--primary'));
  rect(x, y, w, h, min(h/2, w/2));
  fill(isHover ? getCSSVariable('--on-secondary') : getCSSVariable('--on-primary'));
  textAlign(CENTER, CENTER);
  SetFontSize(18);
  text(label, cx, cy);
  pop();
  return { bounds, isHover};
}

function pointInRect(px, py, r) {
    return px > r.x && px < r.x + r.w &&
           py > r.y && py < r.y + r.h;
}

function getCSSVariable(varName) {
  const styles = getComputedStyle(document.body);
  const a = styles.getPropertyValue(varName).trim();
  return a || null;
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK
    : LIGHT;
}

function applyTheme(theme) {
  const themeLink = document.getElementById('theme-link');
  themeLink.href = theme + '.css'; // "dark.css" or "light.css"
  document.body.className = theme; // optional: add class to body for CSS variables
}

document.addEventListener('DOMContentLoaded', () => {
  const theme = getSystemTheme();
  applyTheme(theme);

  // Optional: listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    applyTheme(e.matches ? DARK : LIGHT);
  });
});
