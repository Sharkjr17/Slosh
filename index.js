const starField = document.querySelector('.star-field');
const currentYear = document.querySelector('#current-year');

if (currentYear) {
	currentYear.textContent = new Date().getFullYear();
}
if (starField && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	document.addEventListener('pointermove', (event) => {
		const x = (event.clientX / window.innerWidth) * 100;
		const y = (event.clientY / window.innerHeight) * 100;
		starField.style.background = `radial-gradient(circle at ${x}% ${y}%, #192535 0, transparent 42%), var(--void)`;
	});
}
