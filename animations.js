document.addEventListener('DOMContentLoaded', () => {
    const glitchElements = document.querySelectorAll('.glitch-text');
    glitchElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            el.classList.add('glitch');
        });
        el.addEventListener('mouseout', () => {
            el.classList.remove('glitch');
        });
    });
});