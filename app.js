'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const symbols = document.querySelectorAll('.symbol-card, .element-node');
    const tooltip = document.getElementById('tooltip');

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function describe(el) {
        // The centerpiece carries a whole metric line; elements carry asset + allocation.
        if (el.dataset.metric) return el.dataset.metric;
        return el.dataset.asset + ' — ' + el.dataset.allocation;
    }

    let raf = 0;
    let targetX = 0;
    let targetY = 0;

    function clampX(x, w) { return Math.max(8, Math.min(x, window.innerWidth - w - 8)); }
    function clampY(y, h) { return Math.max(8, Math.min(y, window.innerHeight - h - 8)); }

    function placeAt(x, y) {
        tooltip.style.left = clampX(x, tooltip.offsetWidth) + 'px';
        tooltip.style.top = clampY(y, tooltip.offsetHeight) + 'px';
    }

    function lerp() {
        const cx = parseFloat(tooltip.style.left) || 0;
        const cy = parseFloat(tooltip.style.top) || 0;
        const nx = cx + (targetX - cx) * 0.18;
        const ny = cy + (targetY - cy) * 0.18;
        placeAt(nx, ny);
        if (Math.abs(targetX - nx) > 0.5 || Math.abs(targetY - ny) > 0.5) {
            raf = requestAnimationFrame(lerp);
        } else {
            raf = 0;
        }
    }

    function startFollow(x, y) {
        targetX = x;
        targetY = y;
        if (reduceMotion) { placeAt(x, y); return; }
        if (!raf) raf = requestAnimationFrame(lerp);
    }

    function reveal(el, x, y) {
        tooltip.textContent = describe(el);
        tooltip.classList.add('visible');
        tooltip.classList.remove('hidden');
        placeAt(x + 12, y + 16);
        el.classList.add('is-hovered');
    }

    function conceal(el) {
        tooltip.classList.remove('visible');
        tooltip.classList.add('hidden');
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        el.classList.remove('is-hovered');
    }

    symbols.forEach(symbol => {
        symbol.addEventListener('mouseenter', (e) => {
            reveal(symbol, e.clientX, e.clientY);
        });

        symbol.addEventListener('mousemove', (e) => {
            startFollow(e.clientX + 12, e.clientY + 16);
        });

        symbol.addEventListener('mouseleave', () => {
            conceal(symbol);
        });

        // keyboard parity: focus reveals the same data
        symbol.addEventListener('focusin', (e) => {
            const rect = symbol.getBoundingClientRect();
            reveal(symbol, rect.left + rect.width / 2, rect.top + rect.height / 2);
        });

        symbol.addEventListener('focusout', () => {
            conceal(symbol);
        });
    });

    window.addEventListener('resize', () => {
        if (!tooltip.classList.contains('visible')) return;
        const r = tooltip.getBoundingClientRect();
        placeAt(r.left, r.top);
    });
});