import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { actors, applyCommand, freshDemo } from './model.js';
import { Login, PublicPage } from './public.jsx';
import { Button, Confirm, Icon, Tabs } from './ui.jsx';
import { roleNavigation, Workspace } from './workspace.jsx';
import './styles.css';
import './refinement.css';

const storeKey = 'meridian-demo-v1';
const settingsKey = 'meridian-settings-v1';
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* The current session still works with storage disabled. */ }
}

function allowed(role) {
  if (!Object.hasOwn(actors, role)) return [];
  const entries = [...roleNavigation[role], ['profile', 'Профиль']];
  if (role === 'dispatch') entries.push(['schedule', 'Расписание переговорных']);
  if (role !== 'guard') entries.push(['notifications', 'Уведомления']);
  return entries;
}
function routeFromLocation() {
  const hash = location.hash.slice(1);
  if (hash === 'login') return { page: 'login' };
  if (hash.startsWith('work/')) return { page: 'work', section: hash.slice(5) };
  return { page: 'public' };
}

function Remote({ expanded, setExpanded, role, theme, setTheme, chooseRole, go, openPublic, logout, reset }) {
  const root = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!expanded) return;
    const outside = event => { if (!root.current?.contains(event.target)) setExpanded(false); };
    const escape = event => {
      if (event.key === 'Escape') {
        setExpanded(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [expanded, setExpanded]);
  return <div className="remote" ref={root}>
    <button className="remote-trigger" ref={trigger} aria-label={expanded ? 'Закрыть демопульт' : 'Открыть демопульт'} aria-expanded={expanded}
      aria-controls="remote-panel" type="button" onClick={() => setExpanded(!expanded)}><Icon name={expanded ? 'close' : 'plus'} size={25} /></button>
    {expanded && <section className="remote-panel" id="remote-panel" aria-label="Демопульт">
      <h2>Демопульт</h2>
      <fieldset><legend>Роль</legend><div className="remote-roles">{Object.entries(actors).map(([id, account]) =>
        <button key={id} aria-pressed={role === id} onClick={() => chooseRole(id)}>
          <span><b>{account.role}</b><small>{account.name} · {account.company}</small></span><Icon name="right" size={15} />
        </button>)}</div></fieldset>
      {role && <label>Перейти в раздел<select value="" onChange={event => go(event.target.value)}>
        <option value="" disabled>Выберите страницу</option>{allowed(role).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>}
      <fieldset><legend>Тема</legend>
        <Tabs label="Тема" values={[[ 'light', 'Светлая'], ['dark', 'Тёмная']]} value={theme} onChange={setTheme} />
      </fieldset>
      <div className="remote-links"><Button variant="text" icon="home" onClick={openPublic}>Публичная страница</Button>
        {role && <Button variant="text" icon="logout" onClick={logout}>Выйти</Button>}
        <Button variant="text" onClick={reset}>Начать показ заново</Button></div>
    </section>}
  </div>;
}

function App() {
  const [data, setData] = useState(() => read(storeKey, freshDemo()));
  const latest = useRef(data);
  const [role, setRole] = useState(() => {
    const candidate = read(settingsKey, {}).role;
    return Object.hasOwn(actors, candidate) ? candidate : null;
  });
  const [theme, setTheme] = useState(() => read(settingsKey, {}).theme === 'dark' ? 'dark' : 'light');
  const [route, setRoute] = useState(routeFromLocation);
  const [expanded, setExpanded] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const page = route.page === 'work' && !role ? 'login' : route.page;
  const section = allowed(role).some(([id]) => id === route.section) ? route.section : 'home';

  useEffect(() => {
    const onHash = () => { setRoute(routeFromLocation()); setExpanded(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onHash); };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    write(settingsKey, { role, theme });
  }, [role, theme]);
  useEffect(() => {
    document.title = page === 'work' ? actors[role].role + ' · Меридиан'
      : page === 'login' ? 'Вход · Меридиан' : 'Меридиан — бизнес-центр';
  }, [page, role]);

  function navigate(target, nextSection = 'home') {
    const hash = target === 'public' ? '' : target === 'login' ? '#login' : '#work/' + nextSection;
    if (location.hash !== hash) history.pushState(null, '', location.pathname + location.search + hash);
    setRoute({ page: target, section: nextSection });
    setExpanded(false);
    window.scrollTo(0, 0);
  }
  function chooseRole(actor) {
    setRole(actor);
    setWorkspaceKey(key => key + 1);
    navigate('work');
  }
  function command(input) {
    const result = applyCommand(latest.current, role, input);
    if (result.state) {
      latest.current = result.state;
      write(storeKey, result.state);
      setData(result.state);
    }
    return result;
  }
  function logout() {
    setRole(null);
    navigate('public');
  }
  function reset() {
    latest.current = freshDemo();
    write(storeKey, latest.current);
    setData(latest.current);
    setTheme('light');
    setResetConfirm(false);
    logout();
  }

  return <>
    {page === 'public' && <PublicPage login={() => navigate('login')} />}
    {page === 'login' && <Login openDemo={() => setExpanded(true)} portal={() => navigate('public')} />}
    {page === 'work' && <Workspace key={role + workspaceKey} {...{ role, section, data, command, logout, theme, setTheme }}
      go={id => navigate('work', id)} portal={() => navigate('public')} />}
    <Remote {...{ expanded, setExpanded, role, theme, setTheme, chooseRole, logout }}
      go={id => navigate('work', id)} openPublic={() => navigate('public')} reset={() => { setExpanded(false); setResetConfirm(true); }} />
    {resetConfirm && <Confirm title="Начать показ заново?" text="Демонстрационные обращения, визиты и брони вернутся к исходному набору."
      label="Сбросить демо" onClose={() => setResetConfirm(false)} onConfirm={reset} />}
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
