

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

const openButton = document.getElementById('open-support');
const closeButton = document.getElementById('close-support');
const popup = document.getElementById('support-popup');

// Abre o formulário ao clicar no link do rodapé
openButton.addEventListener('click', function(event) {
    event.preventDefault(); // Impede o link de recarregar a página
    popup.style.display = 'block';
});

// Fecha o formulário ao clicar no "X"
closeButton.addEventListener('click', function() {
    popup.style.display = 'none';
});

// Opcional: Fecha se o usuário clicar fora do formulário
window.addEventListener('click', function(event) {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});