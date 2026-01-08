

document.addEventListener('DOMContentLoaded', () => {
	const sidebars = document.querySelectorAll('.sidebar');

	sidebars.forEach(sidebar => {
		const closeBtn = sidebar.querySelector('.close-btn');

		// Criar o botão hambúrguer logo após a sidebar
		const hamburger = document.createElement('button');
		hamburger.className = 'hamburger-btn material-icons';
		hamburger.setAttribute('aria-label', 'Abrir menu');
		hamburger.textContent = 'menu';
		sidebar.after(hamburger);

		// Atualiza visibilidade do hambúrguer/close: apenas um deve aparecer
		function updateVisibility() {
			const sidebarDisplayed = getComputedStyle(sidebar).display !== 'none';
			const closeDisplayed = closeBtn && getComputedStyle(closeBtn).display !== 'none' && sidebarDisplayed && !sidebar.classList.contains('sidebar--hidden');

			if (closeDisplayed) {
				hamburger.style.display = 'none';
			} else {
				hamburger.style.display = 'inline-flex';
			}
		}

		// Handlers
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				sidebar.classList.add('sidebar--hidden');
				document.body.classList.add('sidebar-collapsed');
				updateVisibility();
			});
		}

		hamburger.addEventListener('click', () => {
			sidebar.classList.remove('sidebar--hidden');
			document.body.classList.remove('sidebar-collapsed');
			updateVisibility();
			hamburger.blur();
		});

		// Atualiza no carregamento e ao redimensionar a janela
		updateVisibility();
		window.addEventListener('resize', updateVisibility);
	});
});