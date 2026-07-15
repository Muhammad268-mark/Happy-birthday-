(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.6 + 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > w) this.speedX *= -1;
            if (this.y < 0 || this.y > h) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 140; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
})();

(function confettiSystem() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, pieces = [];
    let running = false, animId = null;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Confetti {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H - H * 0.2;
            this.w = Math.random() * 8 + 4;
            this.h = Math.random() * 6 + 3;
            this.speedY = Math.random() * 4 + 2;
            this.speedX = (Math.random() - 0.5) * 3;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 10;
            this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
            this.wobble = Math.random() * 10;
            this.wobbleSpeed = Math.random() * 0.05 + 0.02;
            this.life = 1;
            this.decay = Math.random() * 0.005 + 0.002;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.wobble) * 0.4;
            this.wobble += this.wobbleSpeed;
            this.rotation += this.rotSpeed;
            this.life -= this.decay;
            if (this.y > H + 30 || this.life <= 0) {
                this.reset();
                this.y = -20;
                this.life = 1;
            }
            if (this.x < -30) this.x = W + 30;
            if (this.x > W + 30) this.x = -30;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.shadowColor = 'rgba(255,255,255,0.2)';
            ctx.shadowBlur = 8;
            if (this.shape === 'rect') {
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function startConfetti(count = 250) {
        if (running) return;
        running = true;
        pieces = [];
        for (let i = 0; i < count; i++) {
            const p = new Confetti();
            p.y = Math.random() * H * 0.5;
            pieces.push(p);
        }
        if (animId) cancelAnimationFrame(animId);
        loop();
    }

    function stopConfetti() {
        running = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        ctx.clearRect(0, 0, W, H);
    }

    function loop() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        let alive = false;
        for (const p of pieces) {
            p.update();
            p.draw();
            if (p.y < H + 30 && p.life > 0) alive = true;
        }
        if (!alive && pieces.length > 0) {
            for (const p of pieces) p.reset();
        }
        animId = requestAnimationFrame(loop);
    }

    window.startConfetti = startConfetti;
    window.stopConfetti = stopConfetti;

    setTimeout(() => startConfetti(100), 600);
})();

(function updateAge() {
    const birth = new Date(1995, 6, 15);
    const now = new Date();
    let y = now.getFullYear() - birth.getFullYear();
    let m = now.getMonth() - birth.getMonth();
    let d = now.getDate() - birth.getDate();

    if (d < 0) {
        m--;
        const pm = new Date(now.getFullYear(), now.getMonth(), 0);
        d += pm.getDate();
    }
    if (m < 0) {
        y--;
        m += 12;
    }

    document.getElementById('yearsDisplay').textContent = y;
    document.getElementById('monthsDisplay').textContent = m;
    document.getElementById('daysDisplay').textContent = d;
})();

(function cakeLogic() {
    const row = document.getElementById('candlesRow');
    const blowBtn = document.getElementById('blowBtn');
    const relightBtn = document.getElementById('relightBtn');
    const status = document.getElementById('blowStatus');
    let candleCount = 5;
    let litCount = candleCount;
    let isBlowing = false;

    for (let i = 0; i < candleCount; i++) {
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.dataset.index = i;
        candle.innerHTML = `
            <div class="flame" id="flame-${i}"></div>
            <div class="candle-stick"><div class="stripe"></div></div>
        `;
        row.appendChild(candle);
    }

    function updateStatus() {
        if (litCount === 0) {
            status.textContent = '🎉 All candles blown! Make a wish! 🎉';
            status.style.color = '#f1c40f';
            if (typeof window.startConfetti === 'function') window.startConfetti(200);
        } else {
            status.textContent = `🕯️ ${litCount} candle${litCount > 1 ? 's' : ''} still lit. Make a wish!`;
            status.style.color = 'rgba(255,255,255,0.6)';
        }
    }

    function blowCandle() {
        if (isBlowing || litCount === 0) return;
        isBlowing = true;
        blowBtn.style.transform = 'scale(0.95)';

        for (let i = candleCount - 1; i >= 0; i--) {
            const flame = document.getElementById(`flame-${i}`);
            if (flame && !flame.classList.contains('extinguished')) {
                flame.classList.add('extinguished');
                litCount--;
                updateStatus();
                if (typeof window.startConfetti === 'function') window.startConfetti(30);
                break;
            }
        }

        setTimeout(() => {
            isBlowing = false;
            blowBtn.style.transform = '';
        }, 300);
    }

    function relightAll() {
        if (isBlowing) return;
        for (let i = 0; i < candleCount; i++) {
            const flame = document.getElementById(`flame-${i}`);
            if (flame) flame.classList.remove('extinguished');
        }
        litCount = candleCount;
        updateStatus();
        status.textContent = '🕯️ Candles relit! Make a wish!';
        status.style.color = 'rgba(255,255,255,0.6)';
        if (typeof window.startConfetti === 'function') window.startConfetti(80);
    }

    blowBtn.addEventListener('click', blowCandle);
    relightBtn.addEventListener('click', relightAll);

    document.querySelectorAll('.candle').forEach((candle, idx) => {
        candle.addEventListener('click', () => {
            const flame = document.getElementById(`flame-${idx}`);
            if (flame && !flame.classList.contains('extinguished')) {
                flame.classList.add('extinguished');
                litCount--;
                updateStatus();
                if (typeof window.startConfetti === 'function') window.startConfetti(20);
            }
        });
    });

    updateStatus();
})();

(function musicPlayer() {
    const btn = document.getElementById('musicToggle');
    let audioCtx = null;
    let isPlaying = false;
    let timeoutIds = [];

    const notes = [
        { note: 'C4', dur: 0.3 }, { note: 'C4', dur: 0.3 }, { note: 'D4', dur: 0.4 },
        { note: 'C4', dur: 0.4 }, { note: 'F4', dur: 0.4 }, { note: 'E4', dur: 0.6 },
        { note: 'C4', dur: 0.3 }, { note: 'C4', dur: 0.3 }, { note: 'D4', dur: 0.4 },
        { note: 'C4', dur: 0.4 }, { note: 'G4', dur: 0.4 }, { note: 'F4', dur: 0.6 },
        { note: 'C4', dur: 0.3 }, { note: 'C4', dur: 0.3 }, { note: 'C5', dur: 0.4 },
        { note: 'A4', dur: 0.4 }, { note: 'F4', dur: 0.4 }, { note: 'E4', dur: 0.4 },
        { note: 'D4', dur: 0.6 }, { note: 'Bb4', dur: 0.3 }, { note: 'Bb4', dur: 0.3 },
        { note: 'A4', dur: 0.4 }, { note: 'F4', dur: 0.4 }, { note: 'G4', dur: 0.4 },
        { note: 'F4', dur: 0.6 }
    ];

    const freqMap = {
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
        A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
        F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, Bb4: 466.16
    };

    function playTone(freq, duration, time) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + duration);
    }

    function playMelody() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        isPlaying = true;
        btn.textContent = '🔊 Playing...';
        btn.style.opacity = '0.7';

        let time = audioCtx.currentTime + 0.1;
        notes.forEach(n => {
            const freq = freqMap[n.note];
            if (freq) {
                playTone(freq, n.dur, time);
                time += n.dur + 0.05;
            }
        });

        const totalDuration = time - audioCtx.currentTime + 0.5;
        const tid = setTimeout(() => {
            isPlaying = false;
            btn.textContent = '🔇 Play Birthday Song';
            btn.style.opacity = '1';
        }, totalDuration * 1000);
        timeoutIds.push(tid);
    }

    btn.addEventListener('click', () => {
        if (isPlaying) {
            timeoutIds.forEach(id => clearTimeout(id));
            timeoutIds = [];
            if (audioCtx) audioCtx.close().then(() => { audioCtx = null; });
            isPlaying = false;
            btn.textContent = '🔇 Play Birthday Song';
            btn.style.opacity = '1';
            return;
        }
        playMelody();
    });

    window.addEventListener('beforeunload', () => {
        timeoutIds.forEach(id => clearTimeout(id));
        if (audioCtx) audioCtx.close();
    });
})();

(function wishWall() {
    const input = document.getElementById('wishInput');
    const btn = document.getElementById('wishBtn');
    const wall = document.getElementById('wishWall');
    const emojis = ['🌟', '💖', '✨', '🎉', '🌈', '💫', '🎊', '🥳', '🌸', '🌺', '💝', '🔥'];

    function addWish(text) {
        if (!text.trim()) return;
        const empty = wall.querySelector('.empty-wish');
        if (empty) empty.remove();

        const bubble = document.createElement('div');
        bubble.className = 'wish-bubble';
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        bubble.innerHTML = `<span class="wish-emoji">${emoji}</span> ${text.trim()}`;
        const hue = Math.random() * 360;
        bubble.style.borderColor = `hsla(${hue}, 80%, 70%, 0.3)`;
        bubble.style.boxShadow = `0 4px 20px hsla(${hue}, 80%, 60%, 0.15)`;
        wall.appendChild(bubble);
        input.value = '';
        if (typeof window.startConfetti === 'function') window.startConfetti(40);
    }

    btn.addEventListener('click', () => addWish(input.value));
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') addWish(input.value);
    });

    const defaultWishes = [
        '🥳 Happy Birthday Muja Roshi Khan!',
        '💖 May all your dreams come true!',
        '🌟 You are amazing!',
        '🎉 Have a fantastic year ahead!',
        '✨ Stay blessed and happy!'
    ];

    setTimeout(() => {
        defaultWishes.forEach((w, i) => {
            setTimeout(() => addWish(w), i * 300);
        });
    }, 800);
})();

document.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') {
        if (typeof window.startConfetti === 'function') window.startConfetti(300);
    }
    if (e.key === 'b' || e.key === 'B') {
        document.getElementById('blowBtn')?.click();
    }
});

console.log('🎂 Happy Birthday Roshi Khan! 🎂');
console.log('💡 Shortcuts: [C] Confetti  [B] Blow candles');