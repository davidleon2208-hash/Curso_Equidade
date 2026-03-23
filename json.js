const STORAGE_KEYS = {
    users: 'cursoEquidadeUsers',
    session: 'cursoEquidadeSession'
};

const COURSE_STRUCTURE = [
    {
        moduleId: 'modulo-1',
        moduleTitle: 'Modulo 1 - Equidade em Saude',
        pages: [
            { file: 'md01.html', title: 'Introducao', step: 1 },
            { file: 'md01_nuvem.html', title: 'Nuvem de palavras', step: 2 },
            { file: 'md01_ferramenta.html', title: 'Ferramenta pedagogica', step: 3 },
            { file: 'md01_avaliacao.html', title: 'Avaliacao', step: 4 }
        ]
    },
    {
        moduleId: 'modulo-2',
        moduleTitle: 'Modulo 2 - Populacao vulnerabilizada',
        pages: [
            { file: 'md02.html', title: 'Introducao', step: 1 },
            { file: 'md02_nuvem.html', title: 'Nuvem de palavras', step: 2 },
            { file: 'md02_ferramenta.html', title: 'Ferramenta pedagogica', step: 3 },
            { file: 'md02_avaliacao.html', title: 'Avaliacao', step: 4 }
        ]
    },
    {
        moduleId: 'modulo-3',
        moduleTitle: 'Modulo 3 - Racismo e preconceito',
        pages: [
            { file: 'md03.html', title: 'Introducao', step: 1 },
            { file: 'md03_nuvem.html', title: 'Nuvem de palavras', step: 2 },
            { file: 'md03_ferramenta.html', title: 'Ferramenta pedagogica', step: 3 },
            { file: 'md03_avaliacao.html', title: 'Avaliacao', step: 4 }
        ]
    },
    {
        moduleId: 'modulo-4',
        moduleTitle: 'Modulo 4 - Assedio e violencias',
        pages: [
            { file: 'md04.html', title: 'Introducao', step: 1 },
            { file: 'md04_nuvem.html', title: 'Nuvem de palavras', step: 2 },
            { file: 'md04_ferramenta.html', title: 'Ferramenta pedagogica', step: 3 },
            { file: 'md04_avaliacao.html', title: 'Avaliacao', step: 4 }
        ]
    },
    {
        moduleId: 'modulo-5',
        moduleTitle: 'Modulo 5 - Saude mental',
        pages: [
            { file: 'md05.html', title: 'Introducao', step: 1 },
            { file: 'md05_nuvem.html', title: 'Nuvem de palavras', step: 2 },
            { file: 'md05_ferramenta.html', title: 'Ferramenta pedagogica', step: 3 },
            { file: 'md05_avaliacao.html', title: 'Avaliacao', step: 4 }
        ]
    }
];

const COURSE_PAGES = COURSE_STRUCTURE.flatMap((module) =>
    module.pages.map((page) => ({
        ...page,
        moduleId: module.moduleId,
        moduleTitle: module.moduleTitle
    }))
);

const TRACKED_PAGES = [
    ...COURSE_PAGES,
    {
        file: 'agradecimento.html',
        title: 'Conclusao',
        step: 5,
        moduleId: 'conclusao',
        moduleTitle: 'Finalizacao do curso'
    }
];

const PAGE_MAP = TRACKED_PAGES.reduce((accumulator, page) => {
    accumulator[page.file] = page;
    return accumulator;
}, {});

const PUBLIC_PAGES = new Set(['index.html', 'login.html']);
const PROTECTED_PAGES = new Set(['aluno.html', ...TRACKED_PAGES.map((page) => page.file)]);

const firebaseState = {
    initialized: false,
    available: false,
    loadingPromise: null
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch((error) => {
        console.error('Erro ao iniciar a plataforma:', error);
    });
});

async function initializeApp() {
    setupSupportPopup();
    setupSidebarToggle();
    await ensureCloudSupport();

    const currentPage = getCurrentPage();
    const session = getSession();
    const currentUser = session ? getCurrentUser() : null;

    if (PROTECTED_PAGES.has(currentPage) && (!session || !currentUser)) {
        clearSession();
        redirectToLogin(currentPage);
        return;
    }

    if (currentPage === 'login.html') {
        if (session && currentUser) {
            window.location.href = 'aluno.html';
            return;
        }
        clearSession();
        setupAuthPage();
        return;
    }

    if (!session || !currentUser) {
        return;
    }

    if (PAGE_MAP[currentPage]) {
        await markPageAsVisited(currentPage);
        injectSidebarStudentLinks();
        injectCourseProgressBanner(currentPage);
    }

    if (currentPage === 'aluno.html') {
        injectSidebarStudentLinks();
        renderStudentDashboard();
    }

    if (currentPage === 'agradecimento.html') {
        injectSidebarStudentLinks();
    }
}

function getCurrentPage() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
}

function readJsonStorage(key, fallbackValue) {
    try {
        const rawValue = localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (error) {
        console.error(`Erro ao ler ${key}:`, error);
        return fallbackValue;
    }
}

function writeJsonStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    return readJsonStorage(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    writeJsonStorage(STORAGE_KEYS.users, users);
}

function getSession() {
    return readJsonStorage(STORAGE_KEYS.session, null);
}

function saveSession(session) {
    writeJsonStorage(STORAGE_KEYS.session, session);
}

function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
}

function findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return getUsers().find((user) => user.email === normalizedEmail) || null;
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function createEmptyProgress() {
    return {
        visitedPages: {},
        resetCount: 0,
        lastVisitedPage: null,
        updatedAt: null
    };
}

async function hashPassword(password, salt) {
    const normalizedInput = `${salt}:${password}`;

    if (window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
        const encoder = new TextEncoder();
        const data = encoder.encode(normalizedInput);
        const digest = await crypto.subtle.digest('SHA-256', data);

        return Array.from(new Uint8Array(digest))
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('');
    }

    let hash = 2166136261;
    for (let index = 0; index < normalizedInput.length; index += 1) {
        hash ^= normalizedInput.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return `fallback-${(hash >>> 0).toString(16)}`;
}

function generatePasswordSalt() {
    if (window.crypto && typeof crypto.getRandomValues === 'function') {
        const randomValues = crypto.getRandomValues(new Uint8Array(16));
        return Array.from(randomValues)
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('');
    }

    return `salt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function createPasswordCredentials(password) {
    const passwordSalt = generatePasswordSalt();
    const passwordHash = await hashPassword(password, passwordSalt);

    return {
        passwordSalt,
        passwordHash
    };
}

async function verifyUserPassword(user, password) {
    if (user.passwordHash && user.passwordSalt) {
        const candidateHash = await hashPassword(password, user.passwordSalt);
        return candidateHash === user.passwordHash;
    }

    return user.password === password;
}

async function migrateLegacyPassword(user, password) {
    if (!user || user.passwordHash || user.password !== password) {
        return user;
    }

    const passwordCredentials = await createPasswordCredentials(password);
    const migratedUser = {
        ...user,
        ...passwordCredentials,
        password: undefined,
        updatedAt: new Date().toISOString()
    };

    updateUserRecord(migratedUser);
    return migratedUser;
}

function buildUserRecord({ name, email, password, uid, source }) {
    const now = new Date().toISOString();
    return {
        id: uid || `local-${Date.now()}`,
        name: String(name || '').trim(),
        email: normalizeEmail(email),
        passwordHash: password.passwordHash,
        passwordSalt: password.passwordSalt,
        source: source || 'local',
        progress: createEmptyProgress(),
        createdAt: now,
        updatedAt: now
    };
}

function sanitizeSession(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        source: user.source || 'local'
    };
}

function updateUserRecord(updatedUser) {
    const users = getUsers();
    const nextUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
    saveUsers(nextUsers);
}

function persistUser(user) {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
}

function getCurrentUser() {
    const session = getSession();
    if (!session) {
        return null;
    }

    const localUser = getUsers().find((user) => user.id === session.id);
    return localUser || null;
}

function getVisitedCount(progress) {
    return Object.keys(progress.visitedPages || {}).length;
}

function calculateProgress(progress) {
    const totalPages = TRACKED_PAGES.length;
    const visitedCount = getVisitedCount(progress);
    const percentage = totalPages === 0 ? 0 : Math.round((visitedCount / totalPages) * 100);
    return {
        visitedCount,
        totalPages,
        percentage
    };
}

function getNextPage(progress) {
    const visitedPages = progress.visitedPages || {};
    return TRACKED_PAGES.find((page) => !visitedPages[page.file]) || null;
}

function formatDateTime(value) {
    if (!value) {
        return 'Ainda nao registrado';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Ainda nao registrado';
    }

    return date.toLocaleString('pt-BR');
}

function redirectToLogin(currentPage) {
    const target = currentPage && currentPage !== 'login.html' ? `?redirect=${encodeURIComponent(currentPage)}` : '';
    window.location.href = `login.html${target}`;
}

function getRedirectTarget() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && PROTECTED_PAGES.has(redirect)) {
        return redirect;
    }
    return 'aluno.html';
}

function showFeedback(message, type) {
    const feedback = document.getElementById('auth-feedback');
    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.className = `auth-feedback is-visible ${type === 'error' ? 'is-error' : 'is-success'}`;
}

function setAuthLoadingState(isLoading) {
    document.querySelectorAll('.auth-submit').forEach((button) => {
        button.disabled = isLoading;
    });
}

function setupAuthPage() {
    const tabs = document.querySelectorAll('[data-auth-tab]');
    const forms = document.querySelectorAll('[data-auth-form]');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const selected = tab.dataset.authTab;

            tabs.forEach((button) => {
                button.classList.toggle('is-active', button.dataset.authTab === selected);
            });

            forms.forEach((form) => {
                form.classList.toggle('is-hidden', form.dataset.authForm !== selected);
            });
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            setAuthLoadingState(true);

            try {
                const user = await loginStudent({ email, password });
                saveSession(sanitizeSession(user));
                showFeedback('Login realizado com sucesso. Redirecionando...', 'success');
                window.setTimeout(() => {
                    window.location.href = getRedirectTarget();
                }, 500);
            } catch (error) {
                showFeedback(error.message || 'Nao foi possivel entrar.', 'error');
            } finally {
                setAuthLoadingState(false);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            setAuthLoadingState(true);

            try {
                const user = await registerStudent({ name, email, password });
                saveSession(sanitizeSession(user));
                showFeedback('Cadastro realizado com sucesso. Sua area do aluno esta pronta.', 'success');
                window.setTimeout(() => {
                    window.location.href = getRedirectTarget();
                }, 500);
            } catch (error) {
                showFeedback(error.message || 'Nao foi possivel cadastrar.', 'error');
            } finally {
                setAuthLoadingState(false);
            }
        });
    }
}

async function registerStudent({ name, email, password }) {
    const trimmedName = String(name || '').trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password || '');

    if (!trimmedName) {
        throw new Error('Informe o nome do aluno.');
    }

    if (!normalizedEmail) {
        throw new Error('Informe um email valido.');
    }

    if (normalizedPassword.length < 6) {
        throw new Error('A senha precisa ter pelo menos 6 caracteres.');
    }

    if (findUserByEmail(normalizedEmail)) {
        throw new Error('Ja existe um usuario cadastrado com esse email.');
    }

    const passwordCredentials = await createPasswordCredentials(normalizedPassword);
    let user = buildUserRecord({
        name: trimmedName,
        email: normalizedEmail,
        password: passwordCredentials,
        source: 'local'
    });

    persistUser(user);

    if (firebaseState.available) {
        try {
            user = await registerCloudStudent({
                name: trimmedName,
                email: normalizedEmail,
                password: normalizedPassword,
                localUser: user
            });
        } catch (error) {
            console.warn('Falha ao sincronizar cadastro com a nuvem. Mantendo cadastro local.', error);
        }
    }

    return user;
}

async function loginStudent({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password || '');
    let localUser = findUserByEmail(normalizedEmail);

    if (firebaseState.available) {
        try {
            return await loginCloudStudent({
                email: normalizedEmail,
                password: normalizedPassword,
                localUser
            });
        } catch (error) {
            console.warn('Falha no login em nuvem. Tentando modo local.', error);
        }
    }

    const passwordIsValid = localUser ? await verifyUserPassword(localUser, normalizedPassword) : false;

    if (!localUser || !passwordIsValid) {
        throw new Error('Email ou senha invalidos.');
    }

    localUser = await migrateLegacyPassword(localUser, normalizedPassword);
    return localUser;
}

async function markPageAsVisited(fileName) {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const now = new Date().toISOString();
    const progress = user.progress || createEmptyProgress();

    progress.visitedPages[fileName] = now;
    progress.lastVisitedPage = fileName;
    progress.updatedAt = now;

    user.progress = progress;
    user.updatedAt = now;
    updateUserRecord(user);

    if (firebaseState.available && user.source === 'firebase') {
        await syncUserProgressToCloud(user);
    }
}

async function restartStudentProgress() {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const progress = createEmptyProgress();
    progress.resetCount = (user.progress && user.progress.resetCount ? user.progress.resetCount : 0) + 1;
    progress.updatedAt = new Date().toISOString();

    user.progress = progress;
    user.updatedAt = progress.updatedAt;
    updateUserRecord(user);

    if (firebaseState.available && user.source === 'firebase') {
        await syncUserProgressToCloud(user);
    }
}

function logoutStudent() {
    clearSession();
    window.location.href = 'login.html';
}

function setupSidebarToggle() {
    const sidebars = document.querySelectorAll('.sidebar');

    sidebars.forEach((sidebar) => {
        const closeBtn = sidebar.querySelector('.close-btn');
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-btn material-icons';
        hamburger.setAttribute('aria-label', 'Abrir menu');
        hamburger.textContent = 'menu';
        sidebar.after(hamburger);

        function updateVisibility() {
            const sidebarDisplayed = getComputedStyle(sidebar).display !== 'none';
            const closeDisplayed = closeBtn && getComputedStyle(closeBtn).display !== 'none' && sidebarDisplayed && !sidebar.classList.contains('sidebar--hidden');
            hamburger.style.display = closeDisplayed ? 'none' : 'inline-flex';
        }

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

        updateVisibility();
        window.addEventListener('resize', updateVisibility);
    });
}

function setupSupportPopup() {
    const openButton = document.getElementById('open-support');
    const closeButton = document.getElementById('close-support');
    const popup = document.getElementById('support-popup');

    if (!openButton || !closeButton || !popup) {
        return;
    }

    openButton.addEventListener('click', (event) => {
        event.preventDefault();
        popup.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
}

function injectSidebarStudentLinks() {
    const sidebar = document.querySelector('.sidebar');
    const moduleList = document.querySelector('.module-list');
    if (!sidebar || !moduleList || moduleList.querySelector('[data-student-shortcuts="true"]')) {
        return;
    }

    const shortcutWrapper = document.createElement('li');
    shortcutWrapper.setAttribute('data-student-shortcuts', 'true');
    shortcutWrapper.innerHTML = `
        <a href="aluno.html" class="module-item module-item-highlight">Area do aluno</a>
    `;

    moduleList.prepend(shortcutWrapper);

    let sidebarFooter = sidebar.querySelector('.sidebar-footer');
    if (!sidebarFooter) {
        sidebarFooter = document.createElement('div');
        sidebarFooter.className = 'sidebar-footer';
        sidebarFooter.innerHTML = `
            <button class="module-item module-item-logout" type="button" id="student-logout-button">Sair da conta</button>
        `;
        sidebar.appendChild(sidebarFooter);
    }

    sidebarFooter.querySelector('#student-logout-button').addEventListener('click', logoutStudent);
}

function injectCourseProgressBanner(currentPage) {
    const header = document.querySelector('.content-header');
    if (!header || document.querySelector('.student-progress-banner')) {
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const progress = user.progress || createEmptyProgress();
    const stats = calculateProgress(progress);
    const nextPage = getNextPage(progress);
    const currentInfo = PAGE_MAP[currentPage];

    const banner = document.createElement('section');
    banner.className = 'student-progress-banner';
    banner.innerHTML = `
        <div>
            <span class="student-progress-banner__eyebrow">Area do aluno</span>
            <h2>${escapeHtml(user.name)}</h2>
            <p>
                ${stats.visitedCount} de ${stats.totalPages} paginas visitadas.
                ${currentInfo ? `Voce esta em ${escapeHtml(currentInfo.moduleTitle)}.` : ''}
            </p>
        </div>
        <div class="student-progress-banner__meta">
            <strong>${stats.percentage}%</strong>
            <span>Progresso geral</span>
        </div>
        <div class="student-progress-banner__actions">
            <a class="student-action-link" href="aluno.html">Ver painel</a>
            <a class="student-action-link" href="${nextPage ? nextPage.file : 'agradecimento.html'}">Continuar curso</a>
            <button class="student-action-link is-button" type="button" id="restart-progress-inline">Recomecar</button>
        </div>
    `;

    header.insertAdjacentElement('afterend', banner);

    const restartButton = document.getElementById('restart-progress-inline');
    if (restartButton) {
        restartButton.addEventListener('click', async () => {
            const confirmed = window.confirm('Deseja reiniciar o progresso deste aluno?');
            if (!confirmed) {
                return;
            }

            await restartStudentProgress();
            window.location.href = 'md01.html';
        });
    }
}

function renderStudentDashboard() {
    const root = document.getElementById('dashboard-root');
    const user = getCurrentUser();

    if (!root || !user) {
        return;
    }

    const progress = user.progress || createEmptyProgress();
    const stats = calculateProgress(progress);
    const nextPage = getNextPage(progress);
    const lastPageInfo = progress.lastVisitedPage ? PAGE_MAP[progress.lastVisitedPage] : null;
    const cloudStatus = firebaseState.available && user.source === 'firebase'
        ? 'Sincronizacao em nuvem ativa.'
        : 'Modo local ativo. Para sincronizar com banco em nuvem, configure o arquivo firebase-config.js.';

    root.innerHTML = `
        <section class="dashboard-hero">
            <div>
                <span class="dashboard-kicker">Painel do cursista</span>
                <h1 class="main-heading">Ola, ${escapeHtml(user.name)}</h1>
                <p class="dashboard-subtitle">
                    Aqui voce acompanha o processo de visualizacao do curso e pode
                    retomar ou reiniciar quando quiser.
                </p>
            </div>
            <div class="dashboard-progress-ring" aria-label="Progresso geral do curso">
                <strong>${stats.percentage}%</strong>
                <span>Concluido</span>
            </div>
        </section>

        <section class="dashboard-grid">
            <article class="dashboard-card">
                <h2>Resumo</h2>
                <div class="dashboard-metric-row">
                    <div class="dashboard-metric">
                        <strong>${stats.visitedCount}</strong>
                        <span>Paginas visitadas</span>
                    </div>
                    <div class="dashboard-metric">
                        <strong>${stats.totalPages - stats.visitedCount}</strong>
                        <span>Paginas restantes</span>
                    </div>
                    <div class="dashboard-metric">
                        <strong>${progress.resetCount || 0}</strong>
                        <span>Reinicios</span>
                    </div>
                </div>
                <p class="dashboard-support-text">${escapeHtml(cloudStatus)}</p>
            </article>

            <article class="dashboard-card">
                <h2>Conta do aluno</h2>
                <ul class="dashboard-detail-list">
                    <li><strong>Nome:</strong> ${escapeHtml(user.name)}</li>
                    <li><strong>Email:</strong> ${escapeHtml(user.email)}</li>
                    <li><strong>Ultimo acesso:</strong> ${escapeHtml(formatDateTime(progress.updatedAt || user.updatedAt))}</li>
                    <li><strong>Ultima pagina:</strong> ${escapeHtml(lastPageInfo ? `${lastPageInfo.moduleTitle} - ${lastPageInfo.title}` : 'Nenhuma pagina visitada ainda')}</li>
                </ul>
            </article>
        </section>

        <section class="dashboard-card dashboard-card-actions">
            <h2>Acoes rapidas</h2>
            <div class="dashboard-actions">
                <a class="dashboard-button dashboard-button-primary" href="${nextPage ? nextPage.file : 'agradecimento.html'}">
                    ${nextPage ? 'Continuar curso' : 'Ver conclusao'}
                </a>
                <a class="dashboard-button dashboard-button-secondary" href="md01.html">Ir para o inicio</a>
                <button class="dashboard-button dashboard-button-danger" type="button" id="restart-progress-dashboard">Recomecar progresso</button>
                <button class="dashboard-button dashboard-button-ghost" type="button" id="logout-dashboard">Sair</button>
            </div>
        </section>

        <section class="dashboard-card">
            <h2>Andamento por modulo</h2>
            <div class="dashboard-module-list">
                ${COURSE_STRUCTURE.map((module) => renderModuleCard(module, progress)).join('')}
            </div>
        </section>
    `;

    const restartButton = document.getElementById('restart-progress-dashboard');
    const logoutButton = document.getElementById('logout-dashboard');

    if (restartButton) {
        restartButton.addEventListener('click', async () => {
            const confirmed = window.confirm('Deseja apagar o progresso salvo e recomecar o curso?');
            if (!confirmed) {
                return;
            }

            await restartStudentProgress();
            renderStudentDashboard();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logoutStudent);
    }
}

function renderModuleCard(module, progress) {
    const visitedPages = progress.visitedPages || {};
    const visitedPagesInModule = module.pages.filter((page) => visitedPages[page.file]).length;
    const percentage = Math.round((visitedPagesInModule / module.pages.length) * 100);

    return `
        <article class="dashboard-module-card">
            <div class="dashboard-module-card__header">
                <div>
                    <h3>${escapeHtml(module.moduleTitle)}</h3>
                    <p>${visitedPagesInModule} de ${module.pages.length} etapas visitadas</p>
                </div>
                <span class="dashboard-module-card__badge">${percentage}%</span>
            </div>
            <ul class="dashboard-page-list">
                ${module.pages.map((page) => {
                    const visitedAt = visitedPages[page.file];
                    return `
                        <li class="${visitedAt ? 'is-done' : 'is-pending'}">
                            <a href="${page.file}">${page.step}. ${escapeHtml(page.title)}</a>
                            <span>${visitedAt ? `Visitada em ${escapeHtml(formatDateTime(visitedAt))}` : 'Pendente'}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }

            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });
        script.addEventListener('error', () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
        document.head.appendChild(script);
    });
}

async function ensureCloudSupport() {
    if (firebaseState.initialized) {
        return firebaseState.available;
    }

    if (firebaseState.loadingPromise) {
        return firebaseState.loadingPromise;
    }

    firebaseState.loadingPromise = (async () => {
        try {
            await loadScript('firebase-config.js');
            if (!window.CURSO_FIREBASE_CONFIG || !window.CURSO_FIREBASE_CONFIG.apiKey || window.CURSO_FIREBASE_CONFIG.apiKey.includes('SUA_')) {
                firebaseState.initialized = true;
                firebaseState.available = false;
                return false;
            }

            await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');

            if (!window.firebase || !firebase.apps.length) {
                firebase.initializeApp(window.CURSO_FIREBASE_CONFIG);
            }

            firebaseState.available = true;
        } catch (error) {
            console.warn('Firebase nao configurado. Seguindo em modo local.', error);
            firebaseState.available = false;
        }

        firebaseState.initialized = true;
        return firebaseState.available;
    })();

    return firebaseState.loadingPromise;
}

async function registerCloudStudent({ name, email, password, localUser }) {
    const credentials = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const firebaseUser = credentials.user;

    if (firebaseUser && typeof firebaseUser.updateProfile === 'function') {
        await firebaseUser.updateProfile({ displayName: name });
    }

    const cloudUser = {
        ...localUser,
        id: firebaseUser.uid,
        source: 'firebase',
        updatedAt: new Date().toISOString()
    };

    await firebase.firestore().collection('alunos').doc(firebaseUser.uid).set({
        id: cloudUser.id,
        name: cloudUser.name,
        email: cloudUser.email,
        source: cloudUser.source,
        progress: cloudUser.progress,
        createdAt: cloudUser.createdAt,
        updatedAt: cloudUser.updatedAt
    }, { merge: true });

    replaceLocalUser(localUser.id, cloudUser);
    return cloudUser;
}

async function loginCloudStudent({ email, password, localUser }) {
    const credentials = await firebase.auth().signInWithEmailAndPassword(email, password);
    const firebaseUser = credentials.user;
    const documentReference = await firebase.firestore().collection('alunos').doc(firebaseUser.uid).get();
    const cloudData = documentReference.exists ? documentReference.data() : {};
    const passwordCredentials = localUser && localUser.passwordHash && localUser.passwordSalt
        ? {
            passwordHash: localUser.passwordHash,
            passwordSalt: localUser.passwordSalt
        }
        : await createPasswordCredentials(password);

    const mergedUser = {
        ...(localUser || buildUserRecord({
            name: firebaseUser.displayName || email,
            email,
            password: passwordCredentials,
            uid: firebaseUser.uid,
            source: 'firebase'
        })),
        id: firebaseUser.uid,
        name: cloudData.name || firebaseUser.displayName || (localUser ? localUser.name : email),
        email,
        ...passwordCredentials,
        password: undefined,
        source: 'firebase',
        progress: cloudData.progress || (localUser ? localUser.progress : createEmptyProgress()),
        updatedAt: new Date().toISOString()
    };

    upsertUser(mergedUser);
    return mergedUser;
}

async function syncUserProgressToCloud(user) {
    if (!firebaseState.available || !user || user.source !== 'firebase') {
        return;
    }

    await firebase.firestore().collection('alunos').doc(user.id).set({
        progress: user.progress,
        updatedAt: user.updatedAt
    }, { merge: true });
}

function replaceLocalUser(previousId, nextUser) {
    const users = getUsers().map((user) => (user.id === previousId ? nextUser : user));
    saveUsers(users);
}

function upsertUser(nextUser) {
    const users = getUsers();
    const index = users.findIndex((user) => user.id === nextUser.id || user.email === nextUser.email);

    if (index >= 0) {
        users[index] = nextUser;
    } else {
        users.push(nextUser);
    }

    saveUsers(users);
}
