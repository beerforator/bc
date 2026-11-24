import { useRef, useState } from 'react';
import { actors, access, company, day, interval, passNumber, personName, rooms, scoped, time } from './model.js';
import { asset, Brand, Button, Empty, Icon } from './ui.jsx';
import { BookingDetail, GuardPost, RoomForm, RoomSchedule, ShiftJournal, TicketDetail, TicketForm,
  TicketRows, Tickets, VisitDetail, VisitForm, Visits } from './flows.jsx';
import { Company, ProductModule, Profile } from './modules.jsx';

const overview = ['home', 'Обзор', 'home'];
const tickets = ['tickets', 'Обращения', 'ticket'];
const visits = ['visits', 'Посещения', 'pass'];
const bookings = ['bookings', 'Бронирования', 'calendar'];
const services = ['services', 'Сервисы здания', 'stack'];
const content = ['content', 'Новости и документы', 'doc'];
export const roleNavigation = {
  employee: [overview, tickets, visits, bookings, services, content],
  admin: [overview, ['company','Компания','building'], tickets, visits, bookings, services, content],
  dispatch: [overview, ['queue','Очередь УК','ticket'], ['approvals','Согласования','checks'], ['resources','Ресурсы','calendar'],
    ['modules','Объект и модули','building'], ['publications','Публикации','doc'], ['reports','Отчёты','stack']],
  guard: [['home','Пост охраны','shield'], visits, ['journal','Журнал смены','doc'], ['guardParking','Парковка и разгрузка','parking']],
};
const modules = new Set(['services','content','approvals','resources','modules','publications','reports','guardParking']);
const hostName = owner => personName(owner);

function Sidebar({ role, section, go, portal, logout, collapsed, toggle, mobileOpen, closeMobile, theme, setTheme }) {
  const account = actors[role];
  return <>
    {mobileOpen && <button className="mobile-scrim" aria-label="Закрыть меню" onClick={closeMobile} />}
    <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-top">
        <Brand onClick={portal} compact={collapsed && !mobileOpen} />
        <Button icon={collapsed ? 'right' : 'left'} className="collapse" variant="outline" aria-label={collapsed ? 'Развернуть боковое меню' : 'Свернуть боковое меню'}
          aria-expanded={!collapsed} onClick={toggle} />
        <Button className="mobile-menu-close" variant="quiet" icon="close" aria-label="Закрыть меню" onClick={closeMobile} />
      </div>
      <nav aria-label="Рабочее место">{roleNavigation[role].map(([id, label, icon]) =>
        <button key={id} title={label} aria-label={label} aria-current={section === id ? 'page' : undefined} onClick={() => go(id)}>
          <Icon name={icon} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-foot">
        <div className="sidebar-theme" role="group" aria-label="Оформление кабинета">
          {[ ['light', 'Светлая'], ['dark', 'Тёмная'] ].map(([id, title]) => <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}>{title}</button>)}
        </div>
        <button className="profile-link" title="Профиль" aria-label="Открыть профиль" onClick={() => go('profile')}>
          <span className="avatar">{account.name.split(' ').map(v => v[0]).join('')}</span>
          <span><b>{account.name}</b><small>{account.role}</small></span>
        </button>
        <Button variant="quiet" icon="logout" aria-label="Выйти" onClick={logout}><span>Выйти</span></Button>
      </div>
    </aside>
  </>;
}

function TenantOverview({ role, data, open, go }) {
  const admin = role === 'admin';
  const [subject, setSubject] = useState('');
  const scope = admin ? 'company' : 'mine';
  const records = scoped(data.tickets, role, scope).filter(ticket => ticket.status !== 'Закрыта');
  const myVisits = scoped(data.visits, role, scope).filter(v => v.date === day && !v.revoked && v.presence !== 'Завершён');
  const events = [
    ...myVisits.map(v => ({ key: `v${v.id}`, at: v.start, title: v.name, info: `Гость · ${admin ? hostName(v.owner) : 'Главный вход'}`, action: () => open('visit', v.id) })),
    ...scoped(data.bookings, role, scope).filter(b => !b.cancelled && b.end > 600).map(b => ({
      key: `b${b.id}`, at: b.start, title: `Переговорная «${rooms.find(r => r.id === b.room).name}»`,
      info: `${interval(b.start,b.end)} · ${b.title}`, action: () => open('booking', b.id),
    })),
  ].sort((a,b) => a.at - b.at);
  return <div className="dashboard-grid">
    <div className="flow dashboard-primary">
      <section className="surface quick-compose">
        <div className="compose-heading"><span className="compose-icon"><Icon name="ticket" size={24} /></span><div><h2>Чем можем помочь?</h2><p>Расскажите о задаче — управляющая компания на связи.</p></div></div>
        <form className="search-action" onSubmit={e => { e.preventDefault(); open('new-ticket', null, subject); }}>
          <input aria-label="Тема нового обращения" placeholder="Что случилось в офисе?" value={subject} onChange={e => setSubject(e.target.value)} />
          <Button type="submit">Продолжить</Button>
        </form>
      </section>
      <div className="quick-actions">
        <Button variant="outline" icon="person" onClick={() => open('new-visit')}>Пригласить гостя</Button>
        <Button variant="outline" icon="calendar" onClick={() => go('bookings')}>Найти переговорную</Button>
        {admin && <Button variant="outline" icon="building" onClick={() => go('company')}>Сотрудники · 1 приглашение ожидает</Button>}
      </div>
      <section className="surface dashboard-tickets">
        <div className="section-title"><h2>{admin ? 'Обращения компании' : 'Мои обращения'}</h2>
          <Button variant="text" icon="arrow" onClick={() => go('tickets')}>Смотреть все</Button></div>
        <TicketRows mini tickets={[...records].sort((a,b) => b.id - a.id).slice(0,5)} role={role} open={open} />
      </section>
    </div>
    <aside className="surface dashboard-aside">
      <div className="section-title"><h2>Сегодня</h2><span>24 ноября</span></div>
      {events.length === 0 ? <Empty>На сегодня встреч и визитов нет.</Empty> : <ul className="day-list">{events.map(item => <li key={item.key}>
        <button onClick={item.action}><time>{time(item.at)}</time><span><b>{item.title}</b><small>{item.info}</small></span><Icon name="right" size={15} /></button>
      </li>)}</ul>}
      <figure className="lobby-preview"><img src={asset('lobby.webp')} alt="Атриум со стеклянной крышей и стойкой ресепшена" /><figcaption>Главный вход · ресепшен</figcaption></figure>
      <button className="news-preview" onClick={() => go('content')}><span><small>Новости здания</small><b>Проверка вентиляции на пятом этаже</b></span><Icon name="right" size={16} /></button>
    </aside>
  </div>;
}
function DispatchOverview({ data, open, go }) {
  const active = data.tickets.filter(t => t.status !== 'Закрыта')
    .sort((a,b) => Number(!!a.firstReply) - Number(!!b.firstReply) || a.due.localeCompare(b.due));
  return <div className="flow">
    <section className="surface work-section">
      <div className="section-title"><h2>Очередь УК</h2><Button variant="outline" icon="arrow" onClick={() => go('queue')}>Открыть очередь</Button></div>
      <div className="queue-summary"><span><b>{active.filter(t => t.status === 'Новая').length}</b> новых</span><span><b>{active.filter(t => t.assigned).length}</b> назначено</span><span><b>{active.filter(t => !t.firstReply).length}</b> ждут ответа</span></div>
      <TicketRows tickets={active} role="dispatch" open={open} />
    </section>
    <div className="quick-actions">
      <Button variant="outline" icon="checks" onClick={() => go('approvals')}>Согласования</Button>
      <Button variant="outline" icon="building" onClick={() => go('modules')}>Паспорт объекта и модули</Button>
    </div>
  </div>;
}

export function Workspace({ role, section, data, command, go, portal, logout, theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const main = useRef(null);
  const label = roleNavigation[role].find(([id]) => id === section)?.[1]
    || ({ schedule: 'Переговорные', notifications: 'Уведомления', profile: 'Профиль' })[section];
  const account = actors[role];
  const tenant = role === 'employee' || role === 'admin';
  const open = (kind, id, initial) => setDetail({ kind, id, initial });
  const close = () => setDetail(null);
  const navigate = id => { setMobileOpen(false); close(); go(id); main.current?.scrollTo({ top: 0 }); };
  const ticket = detail?.kind === 'ticket' && role !== 'guard' && data.tickets.find(t => t.id === detail.id && access(t, role));
  const visit = detail?.kind === 'visit' && data.visits.find(v => v.id === detail.id && (role === 'guard' || access(v, role)));
  const booking = detail?.kind === 'booking' && tenant && data.bookings.find(b => b.id === detail.id && access(b, role));
  const unread = tenant ? data.tickets.filter(t => t.firstReply && (role === 'admin' ? t.company === company : t.owner === role)).length + 1 : 0;
  return <div className={`app-shell${collapsed ? ' app-shell--compact' : ''}`}>
    <Sidebar {...{ role, section, portal, logout, collapsed, mobileOpen, theme, setTheme }} go={navigate} toggle={() => setCollapsed(!collapsed)} closeMobile={() => setMobileOpen(false)} />
    <div className="work-frame">
      <header className="work-head">
        <Button className="mobile-menu" variant="outline" icon="menu" aria-label="Открыть разделы кабинета" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
        <div className="breadcrumbs"><span>Меридиан</span><span aria-hidden="true">/</span><strong>{label}</strong></div>
        
        {role !== 'guard' && <Button variant="quiet" className="bell" icon="bell" aria-label="Уведомления" onClick={() => navigate('notifications')}>{unread > 0 && <span className="bell-dot" />}</Button>}
        {role === 'guard' && <Button variant="quiet" className="bell" icon="bell" aria-label="События смены" onClick={() => navigate('journal')} />}
        <Button className="head-profile" variant="quiet" icon="person" aria-label="Профиль" onClick={() => navigate('profile')}><span>{account.name}</span></Button>
      </header>
      <main className="work-main" ref={main} key={section}>
        <div className="work-content">
        <div className="work-title">
          <h1>{section === 'home' && role !== 'guard' ? `Доброе утро, ${account.first}` : section === 'notifications' ? 'Уведомления' : label}</h1>
          <p>{role === 'guard' ? 'Главный вход · дневная смена · 24 ноября, 10:00' : section === 'home' ? '24 ноября, вторник · 10:00' : account.role + ' · Меридиан'}</p>
        </div>
        {section === 'home' && (role === 'guard' ? <GuardPost data={data} open={open} />
          : role === 'dispatch' ? <DispatchOverview data={data} open={open} go={navigate} />
            : <TenantOverview {...{ role, data, open }} go={navigate} />)}
        {section === 'tickets' && tenant && <Tickets {...{ role, data, open }} />}
        {section === 'queue' && role === 'dispatch' && <Tickets {...{ role, data, open }} queue />}
        {section === 'visits' && (tenant || role === 'guard') && <Visits {...{ role, data, open }} />}
        {(section === 'bookings' && tenant || section === 'schedule' && role === 'dispatch') && <RoomSchedule {...{ role, data, open }} />}
        {section === 'journal' && role === 'guard' && <ShiftJournal {...{ data, open }} />}
        {section === 'company' && role === 'admin' && <Company {...{ data, open }} />}
        {section === 'profile' && <Profile {...{ role, logout }} />}
        {section === 'notifications' && role === 'dispatch' && <section className="surface work-section"><h2>Новые обращения УК</h2>
          <TicketRows tickets={data.tickets.filter(t => t.status === 'Новая')} role={role} open={open} /></section>}
        {section === 'notifications' && tenant && <ProductModule name="content" title="Новости и документы" initialTab="Уведомления" {...{ data, role, open }} />}
        {modules.has(section) && <ProductModule name={section} title={label} {...{ data, role, open }} />}
        {section === 'resources' && <Button className="section-link" variant="outline" icon="calendar" onClick={() => navigate('schedule')}>Расписание переговорных</Button>}
        </div>
        <footer className="work-footer"><div><span>Объект · Меридиан</span><b>{account.company}</b></div><span>Рабочее пространство</span></footer>
      </main>
    </div>
    {detail?.kind === 'new-ticket' && tenant && <TicketForm {...{ close, command, open }} initial={detail.initial} />}
    {ticket && <TicketDetail key={ticket.id} {...{ ticket, role, close, command }} />}
    {detail?.kind === 'new-visit' && tenant && <VisitForm {...{ role, close, command, open }} />}
    {visit && <VisitDetail key={visit.id} {...{ visit, role, close, command }} />}
    {detail?.kind === 'new-booking' && <RoomForm {...{ data, role, close, command, open }} roomId={detail.id} initial={detail.initial} />}
    {booking && <BookingDetail {...{ booking, close, command }} />}
  </div>;
}
