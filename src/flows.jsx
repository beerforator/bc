import { useRef, useState } from 'react';
import { actors, bookingError, company, day, engineers, entryError, interval, minute, passNumber,
  passStatus, personName, rooms, scoped, time } from './model.js';
import { asset, Badge, Button, Confirm, DetailList, Empty, Icon, Modal, Outside, Tabs } from './ui.jsx';

const statuses = ['Новая', 'Назначена', 'В работе', 'Закрыта'];
const tenant = role => role === 'employee' || role === 'admin';
const locationLabel = office => /^\d+$/.test(office) ? 'Офис ' + office : office;
const form = event => Object.fromEntries(new FormData(event.currentTarget));

export function RecordList({ headings, records, empty }) {
  return <div className="record-table" style={{ "--other-columns": headings.length - 1 }}>
    <div className="records-head" aria-hidden="true">{headings.map(h => <span key={h}>{h}</span>)}<span /></div>
    {records.length ? <ul>{records.map(({ id, fields, action }) => <li key={id}>
      <button type="button" className="record-row" onClick={action}>
        {fields.map((field, i) => <span className={i === 0 ? 'record-main' : ''} key={i}>
          <span className="mobile-label">{headings[i]}</span>{field}</span>)}<Icon name="right" size={16} />
      </button>
    </li>)}</ul> : <Empty>{empty || 'Записей по этим условиям нет.'}</Empty>}
  </div>;
}
export function Scope({ role, value, set }) {
  return role === 'admin' && <Tabs label="Область доступа" values={[[ 'mine', 'Мои'], ['company', 'Компания']]} value={value} onChange={set} />;
}
function Search({ value, set, label, placeholder }) {
  return <label className="search"><Icon name="search" /><input type="search" aria-label={label} placeholder={placeholder} value={value}
    onChange={e => set(e.target.value)} /></label>;
}

export function TicketRows({ tickets, role, open, mini = false }) {
  const dispatch = role === 'dispatch';
  return <RecordList headings={mini ? ['Обращение', 'Статус'] : dispatch ? ['Обращение', 'Исполнитель', 'Срок реакции', 'Статус'] : ['Обращение', 'Обновлено', 'Статус']}
    records={tickets.map(t => ({
      id: t.id, action: () => open('ticket', t.id),
      fields: [
        <><b>№{t.id} · {t.title}</b><small>{locationLabel(t.office)}{dispatch && ' · ' + t.company}</small></>,
        ...(mini ? [] : dispatch ? [t.assigned || 'Не назначен', t.firstReply ? 'Ответ в ' + t.firstReply : 'До ' + t.due] : [t.updated]),
        <Badge>{t.status}</Badge>,
      ],
    }))} />;
}
export function Tickets({ data, role, open, queue = false }) {
  const [scope, setScope] = useState('mine');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(queue ? 'Новые' : '');
  const records = scoped(data.tickets, role, scope);
  const q = query.trim().toLowerCase();
  const queueMap = { 'Новые': 'Новая', 'Назначены': 'Назначена', 'В работе': 'В работе', 'Завершены': 'Закрыта' };
  const queueTabs = ['Новые', 'Все', 'Назначены', 'В работе', 'Завершены'];
  const active = queue ? queueMap[filter] : filter;
  const visible = records.filter(t => (!active || active === t.status) &&
    (!q || [t.id, t.title, t.office, t.company].some(field => String(field).toLowerCase().includes(q))));
  return <section className="surface work-section">
    <div className="section-title"><h2>{queue ? 'Заявки в работу' : scope === 'company' ? 'Обращения компании' : 'Мои обращения'}</h2>
      {!queue && <Button icon="plus" onClick={() => open('new-ticket')}>Создать обращение</Button>}</div>
    {queue ? <Tabs values={queueTabs.map(t => [t, `${t} ${records.filter(r => !queueMap[t] || r.status === queueMap[t]).length}`])}
      value={filter} onChange={setFilter} /> : <Scope role={role} value={scope} set={setScope} />}
    <div className="filters">
      <Search value={query} set={setQuery} label="Поиск обращений" placeholder="Номер, тема или офис" />
      {!queue && <label className="select-field"><span>Статус</span><select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="">Все статусы</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>}
    </div>
    <TicketRows tickets={visible} role={role} open={open} />
  </section>;
}

const topics = [
  ['Климат и вентиляция', 'Сбой кондиционера, жарко, сквозняк или шум вентиляции.'],
  ['Клининг', 'Уборка общих зон или офиса. Например, убрать упаковку после доставки.'],
  ['Безопасность', 'Вопросы доступа, аварийный выход и работа поста охраны.'],
  ['Административные услуги', 'Справки, доступ к ресурсам здания и обращения в офис УК.'],
  ['Жалобы', 'Обратная связь о шуме, нарушении регламента или качестве работ.'],
  ['Работы подрядчиков', 'Разрешение на работы, состав бригады и время доступа.'],
  ['Внос и вынос имущества', 'Перечень имущества, согласование и окно разгрузки.'],
];
export function TicketForm({ close, command, open, initial = '' }) {
  const [category, setCategory] = useState(null);
  const [error, setError] = useState('');
  const [image, setImage] = useState(false);
  const submitting = useRef(false);
  return <Modal title="Создать обращение" eyebrow={category === 0 ? 'Эксплуатация / Климат и вентиляция' : 'Каталог тем'} onClose={close}>
    {category !== 0 ? <div className="flow">
      <div className="topic-grid">{topics.map(([name], index) =>
        <Button variant={index === category ? 'primary' : 'outline'} key={name} onClick={() => setCategory(index)}>{name}</Button>)}</div>
      {category !== null && <div className="notice"><h3>{topics[category][0]}</h3><p>{topics[category][1]}</p><Outside items={['Создание обращения по этой теме']} /></div>}
    </div> : <form className="flow" onSubmit={event => {
      event.preventDefault();
      if (submitting.current) return;
      const result = command({ type: 'ticket-create', ...form(event), image });
      if (result.error) setError(result.error);
      else { submitting.current = true; open('ticket', result.id); }
    }}>
      <DetailList items={[[ 'Объект', 'Меридиан'], ['Компания', company]]} />
      <label>Помещение<select name="office" defaultValue="504"><option value="504">Офис 504 · этаж 5</option><option>5 этаж · общая зона</option></select></label>
      <label>Тема<input name="title" defaultValue={initial} required maxLength={120} placeholder="Жарко в офисе 504" /></label>
      <label>Описание<textarea name="description" rows={4} required maxLength={5000} placeholder="Когда заметили проблему?" /></label>
      <label className="check"><input type="checkbox" checked={image} onChange={e => setImage(e.target.checked)} />Приложить пример фото неисправности</label>
      {image && <img className="evidence" src={asset('vent.webp')} alt="Пример фото вентиляционной решётки" />}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions"><Button variant="outline" onClick={() => setCategory(null)}>Назад к темам</Button><Button type="submit">Отправить обращение</Button></div>
    </form>}
  </Modal>;
}
export function TicketDetail({ ticket, role, close, command }) {
  const [tab, setTab] = useState('Публичная переписка');
  const [engineer, setEngineer] = useState(ticket.assigned || engineers[0]);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const dispatch = role === 'dispatch';
  const action = input => {
    const result = command({ ...input, id: ticket.id });
    setError(result.error || '');
    return !result.error;
  };
  return <Modal wide title={ticket.title} eyebrow={`Обращение №${ticket.id} · ${ticket.company}`} onClose={close}>
    <div className="detail-columns">
      <div className="flow">
        <div className="row"><Badge>{ticket.status}</Badge><span className="muted">{locationLabel(ticket.office)}</span></div>
        <p className="pre">{ticket.description}</p>
        {ticket.image && <figure className="ticket-photo"><img src={asset(ticket.image)} alt={ticket.image === 'repair.webp' ? 'Потолочный светильник' : 'Вентиляционная решётка'} />
          <figcaption>{ticket.status === 'Закрыта' ? 'Результат ремонта' : 'Вложение к обращению'}</figcaption></figure>}
        {ticket.rating && <p className="notice">Оценка арендатора · {ticket.rating}</p>}
        <Tabs values={dispatch ? ['Публичная переписка', 'Внутренние заметки'] : ['Публичная переписка']} value={tab} onChange={setTab} />
        {tab === 'Внутренние заметки' ? <p className="notice">Проверить журнал обслуживания установки перед осмотром. Видит только УК.</p>
          : <ol className="history">{ticket.history.map((item, index) => <li key={index}><b>{item.label}</b>
            <small>{item.at} · {item.author}</small>{item.text && <p className="pre">{item.text}</p>}</li>)}</ol>}
        {dispatch && tab !== 'Внутренние заметки' && ticket.status !== 'Закрыта' && <form className="flow" onSubmit={event => {
          event.preventDefault();
          if (action({ type: 'ticket-reply', text: reply })) setReply('');
        }}><label>Публичный ответ<textarea rows="3" required value={reply} onChange={e => setReply(e.target.value)} /></label>
          <Button type="submit">Ответить</Button></form>}
      </div>
      <div className="flow">
        <DetailList items={[[ 'Автор', personName(ticket.owner)], ['Исполнитель', ticket.assigned || 'Не назначен'],
          ['Срок реакции', 'До ' + ticket.due], ['Первый ответ', ticket.firstReply || 'Ожидается']]} />
        {dispatch && ticket.status !== 'Закрыта' && <form className="flow" onSubmit={event => {
          event.preventDefault(); action({ type: 'ticket-assign', assigned: engineer });
        }}>
          <label>Инженер<select value={engineer} onChange={e => setEngineer(e.target.value)}>{engineers.map(e => <option key={e}>{e}</option>)}</select></label>
          <Button type="submit" disabled={engineer === ticket.assigned}>{ticket.assigned ? 'Переназначить' : 'Назначить'}</Button>
        </form>}
        {error && <p role="alert" className="error">{error}</p>}
        <Button variant="text" icon="left" onClick={close}>Назад к списку</Button>
      </div>
    </div>
  </Modal>;
}

export function VisitRows({ visits, open }) {
  return <RecordList headings={['Посетитель', 'Период', 'Разрешение', 'Присутствие']} records={visits.map(v => ({
    id: v.id, action: () => open('visit', v.id),
    fields: [<><b>{passNumber(v.id)} · {v.name}</b><small>{v.company} · {personName(v.owner)}</small></>,
      <>{v.date.slice(8)}.{v.date.slice(5, 7)} · {interval(v.start, v.end)}</>, <Badge>{passStatus(v)}</Badge>, v.presence],
  }))} />;
}

export function Visits({ data, role, open }) {
  const [scope, setScope] = useState('mine');
  const [tab, setTab] = useState('Сегодня');
  const [query, setQuery] = useState('');
  const records = role === 'guard' ? data.visits : scoped(data.visits, role, scope);
  const q = query.trim().toLowerCase();
  const visible = records.filter(v => (tab === 'История' ? v.revoked || v.presence === 'Завершён'
    : tab === 'Предстоящие' ? !v.revoked && v.date > day : v.date === day) &&
    (!q || `${passNumber(v.id)} ${v.name}`.toLowerCase().includes(q)));
  return <section className="surface work-section">
    <div className="section-title"><h2>{role === 'guard' ? 'Посещения объекта' : scope === 'company' ? 'Гости компании' : 'Мои гости'}</h2>
      {tenant(role) && <Button icon="plus" onClick={() => open('new-visit')}>Пригласить гостя</Button>}</div>
    <Scope role={role} value={scope} set={setScope} />
    <Tabs values={role === 'guard' ? ['Сегодня', 'Предстоящие', 'История'] : ['Сегодня', 'Предстоящие', 'История', 'Бюро пропусков']} value={tab} onChange={setTab} />
    {tab === 'Бюро пропусков' ? <div className="flow">
      <DetailList items={[[ 'Зоны', 'Главный вход · этаж 1 · офис 504'], ['Гостевой носитель', 'Номер пропуска · ручная проверка на посту']]} />
      <Outside items={['Постоянные карты', 'Массовая выдача', 'Мобильный ключ', 'Терминал самообслуживания']} />
    </div> : <>
      <Search value={query} set={setQuery} label="Поиск гостей" placeholder="Номер пропуска или имя" />
      <VisitRows visits={visible} open={open} />
    </>}
  </section>;
}

export function VisitForm({ role, close, command, open }) {
  const [error, setError] = useState('');
  const submitting = useRef(false);
  return <Modal title="Пригласить гостя" eyebrow="Гостевой пропуск" onClose={close}>
    <form className="flow" onSubmit={event => {
      event.preventDefault();
      if (submitting.current) return;
      const fields = form(event);
      const result = command({ type: 'visit-create', ...fields, start: minute(fields.start), end: minute(fields.end) });
      if (result.error) setError(result.error);
      else { submitting.current = true; open('visit', result.id); }
    }}>
      <DetailList items={[[ 'Объект', 'Меридиан'], ['Принимает', actors[role].name], ['Зона', 'Главный вход → офис 504']]} />
      <label>Имя гостя<input name="name" required maxLength={80} placeholder="Имя и фамилия" /></label>
      <label>Дата визита<input type="date" name="date" defaultValue={day} min={day} required /></label>
      <div className="form-pair"><label>Начало<input type="time" name="start" defaultValue="10:00" required /></label>
        <label>Окончание<input type="time" name="end" defaultValue="12:00" required /></label></div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions"><Button variant="outline" onClick={close}>Назад</Button><Button type="submit">Создать пропуск</Button></div>
    </form>
  </Modal>;
}
export function VisitDetail({ visit, role, close, command }) {
  const [confirm, setConfirm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const guard = role === 'guard';
  const reason = entryError(visit);
  if (confirm) return <Confirm title={`Отозвать ${passNumber(visit.id)}?`} text="Охрана увидит отзыв. Если гость внутри, выход можно будет отметить."
    label="Отозвать пропуск" onClose={() => setConfirm(false)} onConfirm={() => {
      const result = command({ type: 'visit-revoke', id: visit.id });
      setConfirm(false); setFeedback(result.error || 'Пропуск отозван.');
    }} />;
  return <Modal title={`${passNumber(visit.id)} · ${visit.name}`} eyebrow="Ручной режим объекта" onClose={close}>
    <div className="flow">
      <div className="row"><Badge>{passStatus(visit)}</Badge><Badge>{visit.presence}</Badge></div>
      <DetailList items={[[ 'Гость', visit.name], ['Принимающая компания', visit.company], ['Принимает', personName(visit.owner)],
        ['Разрешённая зона', visit.zone], ['Период разрешения', `${visit.date.split('-').reverse().join('.')} · ${interval(visit.start, visit.end)}`],
        ['Местонахождение', visit.presence + (visit.presence === 'Внутри' ? ' · с ' + visit.entered : '')]]} />
      {guard && reason && <p className="notice">{reason}</p>}
      {feedback && <p className="notice" role="status">{feedback}</p>}
      <div className="actions">
        <Button variant="text" icon="left" onClick={close}>Назад</Button>
        {guard ? <>
          <Button disabled={!!reason} onClick={() => {
            const r = command({ type: 'visit-in', id: visit.id }); setFeedback(r.error || 'Вход отмечен.');
          }}>Отметить вход</Button>
          <Button disabled={visit.presence !== 'Внутри'} variant="outline" onClick={() => {
            const r = command({ type: 'visit-out', id: visit.id }); setFeedback(r.error || 'Выход отмечен.');
          }}>Отметить выход</Button>
        </> : tenant(role) && !visit.revoked && visit.presence !== 'Завершён' && <Button variant="outline" onClick={() => setConfirm(true)}>Отозвать</Button>}
      </div>
    </div>
  </Modal>;
}
export function GuardPost({ data, open }) {
  const [query, setQuery] = useState('');
  const [missing, setMissing] = useState(false);
  function search(event) {
    event.preventDefault();
    const match = /^(?:[ГG][-– ]?)?(\d+)$/iu.exec(query.trim());
    const visit = match && data.visits.find(v => v.id === +match[1]);
    setMissing(!visit);
    if (visit) open('visit', visit.id);
  }
  const today = data.visits.filter(v => v.date === day);
  const expected = today.filter(v => !v.revoked && v.presence === 'Ожидается');
  const inside = today.filter(v => v.presence === 'Внутри');
  return <div className="flow">
    <section className="guard-search surface">
      <div className="row"><span className="icon-tile"><Icon name="shield" size={24} /></span><h2>Проверить пропуск</h2></div>
      <form className="search-action" onSubmit={search}><input name="pass" aria-label="Номер пропуска" placeholder="Например, Г-210" required
        value={query} onChange={e => { setQuery(e.target.value); setMissing(false); }} />
        <Button type="submit" icon="search">Проверить</Button></form>
      {missing && <p className="error" role="alert">Пропуск не найден. Проверьте номер.</p>}
    </section>
    <section className="surface work-section"><div className="section-title"><h2>Внутри</h2><span>{inside.length}</span></div><VisitRows visits={inside} open={open} /></section>
    <section className="surface work-section"><div className="section-title"><h2>Ожидаются</h2><span>{expected.length}</span></div><VisitRows visits={expected} open={open} /></section>
  </div>;
}
export function ShiftJournal({ data, open }) {
  return <section className="surface work-section"><h2>Журнал смены · 24 ноября</h2>
    <RecordList headings={['Пропуск', 'Время', 'Событие', 'Сотрудник']}
      records={[...data.journal].reverse().map((item, index) => ({ id: index, action: () => open('visit', item.id),
        fields: [<b>{passNumber(item.id)}</b>, item.at, item.label, item.author] }))} />
  </section>;
}

export function RoomSchedule({ data, role, open }) {
  const [tab, setTab] = useState('schedule');
  const [fullDay, setFullDay] = useState(false);
  const slots = fullDay ? Array.from({ length: 12 }, (_, i) => 480 + i * 60) : [660, 720, 780, 840];
  const records = scoped(data.bookings, role, tab);
  return <section className="surface work-section">
    <div className="section-title"><h2>Переговорные</h2><span>24 ноября · 08:00–20:00</span></div>
    <Tabs values={[[ 'schedule', 'Расписание'], ...(tenant(role) ? [['mine', 'Мои брони']] : []), ...(role === 'admin' ? [['company','Компания']] : [])]}
      value={tab} onChange={setTab} />
    {tab === 'schedule' && <Button className="schedule-toggle" variant="text" aria-pressed={fullDay} onClick={() => setFullDay(!fullDay)}>
      {fullDay ? 'Показать основные интервалы' : 'Показать весь день'}
    </Button>}
    {tab !== 'schedule' ? <RecordList headings={['Встреча', 'Комната', 'Время', 'Статус']}
      records={records.map(b => ({ id: b.id, action: () => open('booking', b.id),
        fields: [<b>{b.title}</b>, rooms.find(r => r.id === b.room).name, interval(b.start,b.end), <Badge>{b.cancelled ? 'Отменена' : 'Подтверждена'}</Badge>] }))} />
      : <div className="room-grid">{rooms.map(room => {
        const booked = data.bookings.filter(b => !b.cancelled && b.room === room.id);
        return <article className="room-card" key={room.id}>
          <img src={asset(room.image)} alt={`Переговорная «${room.name}»`} />
          <div className="flow">
            <h3>«{room.name}»</h3><p className="muted">{room.floor} этаж · {room.seats} мест · {room.kit}</p>
            <ul className="room-slots">{slots.map(start => {
              const used = booked.some(b => b.start < start + 60 && b.end > start);
              return <li key={start}><span>{interval(start,start + 60)}</span><Badge>{used ? 'Занято' : 'Свободно'}</Badge>
                {!used && tenant(role) && <Button variant="text" aria-label={`Выбрать ${room.name} ${time(start)}`} onClick={() => open('new-booking', room.id, start)}>Выбрать</Button>}</li>;
            })}</ul>
            <Button onClick={() => open('new-booking', room.id, 720)} variant="outline">{tenant(role) ? 'Забронировать' : 'Открыть расписание'}</Button>
          </div>
        </article>;
      })}</div>}
  </section>;
}
export function RoomForm({ data, role, roomId, initial, close, command, open }) {
  const room = rooms.find(r => r.id === roomId);
  const [start, setStart] = useState(initial ?? 720);
  const [duration, setDuration] = useState(60);
  const [seats, setSeats] = useState(4);
  const [error, setError] = useState('');
  const sending = useRef(false);
  const invalid = bookingError(data.bookings, room, start, duration, seats);
  const booked = data.bookings.filter(b => b.room === room.id && !b.cancelled).sort((a,b) => a.start - b.start);
  return <Modal title={`Переговорная «${room.name}»`} eyebrow="24 ноября · расписание объекта" onClose={close}>
    <div className="flow">
      <img className="room-detail-img" src={asset(room.image)} alt={`Интерьер, ${room.name}`} />
      <p>{room.floor} этаж · {room.seats} мест · {room.kit}</p>
      <p className="notice">Занятые интервалы: {booked.length ? booked.map(b => interval(b.start, b.end)).join(', ') : 'нет'}</p>
      {tenant(role) ? <form className="flow" onSubmit={event => {
        event.preventDefault();
        if (sending.current || invalid) return;
        const result = command({ type: 'booking-create', room: room.id, start, duration, seats, title: form(event).title });
        if (result.error) setError(result.error);
        else { sending.current = true; open('booking', result.id); }
      }}>
        <div className="form-pair">
          <label>Начало<select value={start} onChange={e => setStart(+e.target.value)}>
            {Array.from({ length: 47 }, (_, i) => 480 + i * 15).map(value => <option key={value} value={value}>{time(value)}</option>)}</select></label>
          <label>Длительность<select value={duration} onChange={e => setDuration(+e.target.value)}>
            {Array.from({ length: 15 }, (_, i) => 30 + i * 15).map(value => <option key={value} value={value}>{value} мин</option>)}</select></label>
        </div>
        <label>Участники<input type="number" min="1" max={room.seats} value={seats || ''} onChange={e => setSeats(+e.target.value)} required /></label>
        <label>Название встречи<input name="title" maxLength={100} placeholder="Встреча команды" /></label>
        {(invalid || error) && <p className="error" role="alert">{invalid || error}</p>}
        <div className="actions"><Button variant="outline" onClick={close}>Назад</Button><Button type="submit" disabled={!!invalid}>Подтвердить бронь</Button></div>
      </form> : <Button variant="outline" onClick={close}>Назад к расписанию</Button>}
    </div>
  </Modal>;
}
export function BookingDetail({ booking, close, command }) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const room = rooms.find(r => r.id === booking.room);
  if (confirm) return <Confirm title="Отменить бронь?" text={`«${room.name}» · ${interval(booking.start, booking.end)}. Интервал освободится.`}
    label="Отменить бронь" onClose={() => setConfirm(false)} onConfirm={() => {
      const r = command({ type: 'booking-cancel', id: booking.id }); setError(r.error || ''); setConfirm(false);
    }} />;
  return <Modal title={booking.title} eyebrow={`Переговорная «${room.name}»`} onClose={close}>
    <div className="flow"><div><Badge>{booking.cancelled ? 'Отменена' : 'Подтверждена'}</Badge></div>
      <DetailList items={[[ 'Интервал', interval(booking.start, booking.end)], ['Дата', '24 ноября'], ['Этаж', room.floor],
        ['Участники', booking.seats], ['Организатор', personName(booking.owner)]]} />
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions"><Button variant="text" icon="left" onClick={close}>Назад</Button>
        {!booking.cancelled && <Button variant="outline" onClick={() => setConfirm(true)}>Отменить бронь</Button>}</div>
    </div>
  </Modal>;
}
