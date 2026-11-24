const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* barra de progresso + link ativo do menu */
const links = $$('.menu a');
const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
function onScroll() {
    const h = document.documentElement;
    $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
    const y = h.scrollTop + 120;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= y) current = s; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* menu mobile */
const burger = $('#burger'), menu = $('#menu');
burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
});
links.forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
}));

/* brilho que segue o cursor na página */
addEventListener('pointermove', e => {
    const g = $('#glow');
    g.style.setProperty('--gx', e.clientX + 'px');
    g.style.setProperty('--gy', e.clientY + 'px');
}, { passive: true });

/* luz dentro dos cards */
$$('.spot').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
}));

/* inclinação 3D da foto */
const tilt = $('#tilt'), img = $('img', tilt);
if (!reduce) {
    tilt.addEventListener('pointermove', e => {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        img.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    });
    tilt.addEventListener('pointerleave', () => img.style.transform = '');
}

/* texto que se digita sozinho */
const words = ['interfaces responsivas', 'aplicações em React', 'soluções com Python', 'projetos que aprendem comigo'];
const typed = $('#typed');
let w = 0, c = 0, del = false;
function type() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1600); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
}
reduce ? typed.textContent = words[0] : type();

/* contadores do hero */
function count(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) return el.textContent = target + suffix;
    let n = 0;
    const step = Math.max(1, Math.round(target / 40));
    const t = setInterval(() => {
        n = Math.min(target, n + step);
        el.textContent = n + suffix;
        if (n === target) clearInterval(t);
    }, 30);
}
$$('[data-count]').forEach(count);

/* habilidades por abas */
const skills = {
    front: ['HTML5, CSS3, JavaScript, React e desenvolvimento de interfaces responsivas.', ['HTML5', 'CSS3', 'JavaScript', 'React']],
    prog: ['JavaScript, Python e Java, com foco em lógica de programação e resolução de problemas.', ['JavaScript', 'Python', 'Java', 'POO']],
    db: ['Conhecimentos em MySQL, SQL e integração entre JavaScript e banco de dados.', ['MySQL', 'SQL']],
    tools: ['Ferramentas do dia a dia para versionar, organizar e entregar projetos.', ['Git', 'GitHub', 'VS Code', 'Trello', 'Pacote Office']],
    ti: ['Atendimento ao usuário, resolução de problemas, manutenção e organização de equipamentos.', ['Atendimento', 'Manutenção', 'Organização']],
    soft: ['Trabalho em equipe, comunicação, organização, aprendizado rápido e proatividade.', ['Equipe', 'Comunicação', 'Proatividade']]
};
const panel = $('#skillPanel');
function showSkill(key) {
    panel.classList.add('swap');
    setTimeout(() => {
        $('#skillText').textContent = skills[key][0];
        $('#skillTags').innerHTML = skills[key][1].map(t => `<span class="tag">${t}</span>`).join('');
        panel.classList.remove('swap');
    }, reduce ? 0 : 180);
}
$$('[data-skill]').forEach(b => b.addEventListener('click', () => {
    $$('[data-skill]').forEach(x => x.classList.toggle('active', x === b));
    showSkill(b.dataset.skill);
}));
showSkill('front');

/* filtro de projetos */
$$('[data-filter]').forEach(b => b.addEventListener('click', () => {
    $$('[data-filter]').forEach(x => x.classList.toggle('active', x === b));
    const f = b.dataset.filter;
    $$('.project').forEach(p => {
        const ok = f === 'all' || p.dataset.tech.split(' ').includes(f);
        p.classList.toggle('hide', !ok);
        if (ok) { p.classList.remove('show'); void p.offsetWidth; p.classList.add('show'); }
    });
}));

/* copiar e-mail */
$('#copyMail').addEventListener('click', async () => {
    const toast = $('#toast');
    try {
        await navigator.clipboard.writeText('matheusrodrigues.sa08@gmail.com');
        toast.textContent = 'E-mail copiado';
    } catch {
        toast.textContent = 'Não foi possível copiar. Use o botão Enviar e-mail';
    }
    toast.classList.add('on');
    setTimeout(() => toast.classList.remove('on'), 2200);
});

/* entrada suave das seções ao rolar */
$$('section .container > *').forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));
