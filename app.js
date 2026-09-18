'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const symbols = document.querySelectorAll('.symbol-card, .element-node');
    const tooltip = document.getElementById('tooltip');

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function describe(el) {
        // Ouroboros carries a full metric line; nodes carry asset + allocation.
        if (el.dataset.metric) return el.dataset.metric;
        return el.dataset.asset + ' — ' + el.dataset.allocation + ' allocation';
    }

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let shown = false;

    function place(x, y) {
        if (reduceMotion) {
            snap(x, y);
            return;
        }
        targetX = x;
        targetY = y;
        if (!raf) raf = requestAnimationFrame(lerp);
    }

    function lerp() {
        const tx = tooltip.offsetWidth;
        const ty = tooltip.offsetHeight;
        let cx = parseFloat(tooltip.style.left) || 0;
        let cy = parseFloat(tooltip.style.top) || 0;
        cx += (targetX - cx) * 0.18;
        cy += (targetY - cy) * 0.18;
        tooltip.style.left = clampX(cx, tx) + 'px';
        tooltip.style.top = clampY(cy, ty) + 'px';
        if (Math.abs(targetX - cx) > 0.5 || Math.abs(targetY - cy) > 0.5) {
            raf = requestAnimationFrame(lerp);
        } else {
            raf = 0;
        }
    }

    function snap(x, y) {
        tooltip.style.left = clampX(x, tooltip.offsetWidth) + 'px';
        tooltip.style.top = clampY(y, tooltip.offsetHeight) + 'px';
    }

    function clampX(x, w) {
        return Math.max(8, Math.min(x, window.innerWidth - w - 8));
    }
    function clampY(y, h) {
        return Math.max(8, Math.min(y, window.innerHeight - h - 8));
    }

    function show(el, x, y) {
        tooltip.textContent = describe(el);
        tooltip.classList.add('visible');
        tooltip.classList.remove('hidden');
        shown = true;
        // measure after content is set, then position (offset by 14px below the cursor)
        if (reduceMotion) {
            snap(x + 12, y + 16);
        } else {
            tooltip.style.left = clampX(x + 12, tooltip.offsetWidth) + 'px';
            tooltip.style.top = clampY(y + 16, tooltip.offsetHeight) + 'px';
            raf = 0;
        }
        el.classList.add('is-hovered');
    }

    function hide(el) {
        shown = false;
        tooltip.classList.remove('visible');
        tooltip.classList.add('hidden');
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        el.classList.remove('is-hovered');
    }

    symbols.forEach(symbol => {
        symbol.addEventListener('mouseenter', (e) => {
            show(symbol, e.clientX, e.clientY);
        });

        symbol.addEventListener('mousemove', (e) => {
            // track the cursor smoothly while moving inside the node
            targetX = e.clientX + 12;
            targetY = e.clientY + 16;
            if (reduceMotion) { snap(targetX, targetY); return; }
            if (!raf) raf = requestAnimationFrame(lerp);
        });

        symbol.addEventListener('mouseleave', () => {
            hide(symbol);
        });

        // keyboard parity for the same reveal
        symbol.addEventListener('focusin', (e) => {
            const rect = symbol.getBoundingClientRect();
            show(symbol, rect.left + rect.width / 2, rect.top + rect.height / 2);
        });

        symbol.addEventListener('focusout', () => {
            hide(symbol);
        });
    });

    // never trap the tooltip at a stale position if the window resizes
    window.addEventListener('resize', () => {
        if (!shown) return;
        const r = tooltip.getBoundingClientRect();
        snap(r.left, r.top);
    });
});