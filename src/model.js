export const day = '2026-11-24';
export const company = 'ООО «Контур света»';
export const actors = {
  employee: { name: 'Дарья Исаева', first: 'Дарья', role: 'Сотрудник арендатора', company },
  admin: { name: 'Тимур Ларин', first: 'Тимур', role: 'Администратор арендатора', company },
  dispatch: { name: 'Мария Сазонова', first: 'Мария', role: 'Диспетчер УК', company: 'УК «Квартал»' },
  guard: { name: 'Игорь Власов', first: 'Игорь', role: 'Охрана', company: 'Главный вход' },
};
export const engineers = ['Олег Зорин', 'Алина Круглова', 'Денис Титов'];
export const offices = [
  { id: 302, area: 48, seats: 6, floor: 3, description: 'Открытое пространство на шесть мест и небольшая комната для встреч.' },
  { id: 405, area: 86, seats: 12, floor: 4, description: 'Рабочий зал с отдельной переговорной и зоной для коротких встреч.' },
  { id: 601, area: 144, seats: 18, floor: 6, description: 'Угловой офис с переговорной, отдельной тихой комнатой и лаунжем.' },
];
export const rooms = [
  { id: 'orion', name: 'Орион', floor: 2, seats: 6, kit: 'Экран и доска', image: 'orion.webp' },
  { id: 'vega', name: 'Вега', floor: 5, seats: 10, kit: 'Видеосвязь и экран', image: 'vega.webp' },
];
export const team = [
  { id: 'employee', name: 'Дарья Исаева', title: 'Офис-менеджер', email: 'd.isaeva@example.org', role: 'Сотрудник' },
  { id: 'sofia', name: 'Софья Белая', title: 'Координатор проектов', email: 's.belaya@example.org', role: 'Сотрудник' },
  { id: 'admin', name: 'Тимур Ларин', title: 'Руководитель офиса', email: 't.larin@example.org', role: 'Администратор' },
];
export const personName = id => team.find(person => person.id === id)?.name || 'Антон Миронов';
export const time = minutes => [Math.floor(minutes / 60), minutes % 60].map(n => String(n).padStart(2, '0')).join(':');
export const interval = (start, end) => `${time(start)}–${time(end)}`;
export const minute = value => {
  if (!/^\d\d:\d\d$/.test(value)) return NaN;
  const [hours, minutes] = value.split(':').map(Number);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : NaN;
};

const journalItem = (label, author, at, text = '') => ({ label, author, at, text });

export function freshDemo() {
  return {
    seq: 0,
    tickets: [
      { id: 1041, title: 'Гул в вентиляции', owner: 'employee', company, office: '504', status: 'В работе', assigned: 'Олег Зорин', due: '10:45', firstReply: '09:15', updated: '09:35', image: 'vent.webp', description: 'С утра слышен гул над потолком у окна. Он усиливается при включении вентиляции.',
        history: [journalItem('Создано обращение', 'Дарья Исаева', '09:00'), journalItem('Ответ УК', 'Мария Сазонова', '09:15', 'Инженер проверит установку на пятом этаже.'), journalItem('Взято в работу', 'Олег Зорин', '09:35')] },
      { id: 1032, title: 'Замена лампы', owner: 'employee', company, office: '504', status: 'Закрыта', assigned: 'Олег Зорин', due: '09:30', firstReply: '08:45', updated: '09:10', image: 'repair.webp', rating: '5 из 5', description: 'Погас светильник возле шкафа в рабочей зоне.',
        history: [journalItem('Создано обращение', 'Дарья Исаева', '08:30'), journalItem('Назначена', 'Мария Сазонова', '08:40'), journalItem('В работе', 'Олег Зорин', '08:47'), journalItem('Выполнена', 'Олег Зорин', '09:00', 'Лампа заменена. Светильник проверен.'), journalItem('Закрыта', 'Дарья Исаева', '09:10', 'Свет работает. Оценка 5 из 5.')] },
      { id: 1042, title: 'Уборка после доставки', owner: 'sofia', company, office: '504', status: 'Новая', assigned: '', due: '10:30', updated: '09:48', description: 'После доставки мебели у переговорной осталась упаковка.',
        history: [journalItem('Создано обращение', 'Софья Белая', '09:48')] },
      { id: 1043, title: 'Подтекает кран', owner: 'external', company: 'ООО «Форма»', office: '402', status: 'Назначена', assigned: 'Олег Зорин', due: '10:50', updated: '09:55', description: 'Кран в мини-кухне подтекает после закрытия.',
        history: [journalItem('Создано обращение', 'Антон Миронов', '09:40'), journalItem('Назначена', 'Мария Сазонова', '09:55')] },
    ],
    visits: [
      { id: 210, name: 'Кирилл Левин', owner: 'employee', company, date: day, start: 570, end: 720, zone: 'Главный вход → офис 504', presence: 'Ожидается', revoked: false },
      { id: 211, name: 'Вера Орлова', owner: 'sofia', company, date: day, start: 540, end: 720, zone: 'Главный вход → офис 504', presence: 'Внутри', revoked: false, entered: '09:12' },
      { id: 212, name: 'Артём Никифоров', owner: 'external', company: 'ООО «Форма»', date: day, start: 600, end: 660, zone: 'Главный вход → офис 402', presence: 'Ожидается', revoked: true },
    ],
    bookings: [
      { id: 50, room: 'orion', owner: 'external', company: 'ООО «Форма»', start: 660, end: 720, seats: 5, title: 'Встреча с командой' },
      { id: 51, room: 'vega', owner: 'employee', company, start: 840, end: 900, seats: 6, title: 'Планирование на декабрь' },
    ],
    journal: [
      { id: 211, at: '09:12', label: 'Вход', author: 'Игорь Власов' },
      { id: 212, at: '09:45', label: 'Отзыв', author: 'Администратор ООО «Форма»' },
    ],
  };
}
export const nextNumber = (items, baseline) => Math.max(baseline, ...items.map(item => item.id)) + 1;
export const passNumber = id => `Г-${id}`;
export const passStatus = visit => visit.revoked ? 'Отозван' : visit.presence === 'Завершён' ? 'Завершён' : 'Активен';

export function access(record, actor) {
  return actor === 'dispatch' || record.owner === actor || (actor === 'admin' && record.company === company);
}
export function scoped(records, actor, scope) {
  return records.filter(r => actor === 'dispatch' || (scope === 'company' && actor === 'admin' ? r.company === company : r.owner === actor));
}
export function bookingError(bookings, room, start, duration, seats) {
  if (!room || !Number.isInteger(start) || start < 480 || start % 15 || !Number.isInteger(duration) ||
      duration < 30 || duration > 240 || duration % 15 || start + duration > 1200) return 'Выберите время с 08:00 до 20:00 и длительность от 30 минут до 4 часов.';
  if (!Number.isInteger(seats) || seats < 1 || seats > room.seats) return `В этой комнате от 1 до ${room.seats} мест.`;
  if (bookings.some(b => !b.cancelled && b.room === room.id && start < b.end && start + duration > b.start)) return 'Этот интервал пересекается с занятой бронью.';
  return '';
}
export function entryError(visit) {
  if (visit.revoked) return 'Вход недоступен — разрешение отозвано.';
  if (visit.presence !== 'Ожидается') return 'Этот пропуск уже использован.';
  if (visit.date !== day) return 'Пропуск оформлен на другую дату.';
  if (visit.start > 600 || visit.end <= 600) return 'В 10:00 демосмены разрешение не действует.';
  return '';
}

export function applyCommand(state, actor, command) {
  const { type, id } = command;
  const prev = type.startsWith('ticket') ? state.tickets.find(item => item.id === id)
    : type.startsWith('visit') ? state.visits.find(item => item.id === id) : state.bookings.find(item => item.id === id);
  const name = actors[actor]?.name;
  const at = time(600 + Math.min(state.seq, 199));
  const patch = (key, callback) => ({ [key]: state[key].map(record => record.id === id ? callback(record) : record) });
  const success = (changes, newId = id) => ({ state: { ...state, ...changes, seq: state.seq + 1 }, id: newId });
  const fail = error => ({ error });
  const tenantRole = ['employee', 'admin'].includes(actor);

  switch (type) {
    case 'ticket-create': {
      const title = command.title.trim();
      const description = command.description.trim();
      if (!tenantRole || !title || !description || !['504', '5 этаж · общая зона'].includes(command.office)) return fail('Заполните тему, описание и разрешённое помещение.');
      const newId = nextNumber(state.tickets, 1043);
      const record = { id: newId, owner: actor, company, title, description, office: command.office,
        image: command.image ? 'vent.webp' : '', status: 'Новая', assigned: '', updated: at, due: '12:00',
        history: [journalItem('Создано обращение', name, at)] };
      return success({ tickets: [record, ...state.tickets] }, newId);
    }
    case 'ticket-assign':
    case 'ticket-reply': {
      if (actor !== 'dispatch' || !prev || prev.status === 'Закрыта') return fail('Действие недоступно.');
      const assign = type === 'ticket-assign';
      const reply = command.text?.trim();
      if (assign ? !engineers.includes(command.assigned) || prev.assigned === command.assigned : !reply) return fail(assign ? 'Выберите другого исполнителя.' : 'Введите текст ответа.');
      const event = assign ? journalItem('Назначен исполнитель', name, at, command.assigned) : journalItem('Ответ УК', name, at, reply);
      return success(patch('tickets', record => ({
        ...record, updated: at,
        ...(assign ? { assigned: command.assigned, status: record.status === 'Новая' ? 'Назначена' : record.status } : { firstReply: record.firstReply || at }),
        history: [...record.history, event],
      })));
    }
    case 'visit-create': {
      const guest = command.name.trim();
      const { date, start, end } = command;
      if (!tenantRole || !guest || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < day ||
        !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end >= 1440 || end <= start) return fail('Укажите гостя и корректный период в пределах одного дня.');
      const newId = nextNumber(state.visits, 212);
      return success({ visits: [{ id: newId, owner: actor, company, name: guest, date, start, end,
        zone: 'Главный вход → офис 504', presence: 'Ожидается', revoked: false }, ...state.visits] }, newId);
    }
    case 'visit-revoke':
    case 'visit-in':
    case 'visit-out': {
      const revoke = type === 'visit-revoke';
      const enter = type === 'visit-in';
      if (!prev || (revoke ? !tenantRole || !access(prev, actor) || prev.revoked || prev.presence === 'Завершён' : actor !== 'guard')) return fail('Действие недоступно.');
      if (enter && entryError(prev)) return fail(entryError(prev));
      if (type === 'visit-out' && prev.presence !== 'Внутри') return fail('Нет отметки о входе.');
      return success({ ...patch('visits', record => ({
        ...record, ...(revoke ? { revoked: true } : enter ? { presence: 'Внутри', entered: at } : { presence: 'Завершён', exited: at }),
      })), journal: [...state.journal, { id, at, label: revoke ? 'Отзыв' : enter ? 'Вход' : 'Выход', author: name }] });
    }
    case 'booking-create': {
      if (!tenantRole) return fail('Бронирование недоступно для этой роли.');
      const room = rooms.find(r => r.id === command.room);
      const error = bookingError(state.bookings, room, command.start, command.duration, command.seats);
      if (error) return fail(error);
      const newId = nextNumber(state.bookings, 51);
      return success({ bookings: [...state.bookings, { id: newId, owner: actor, company,
        room: room.id, start: command.start, end: command.start + command.duration, seats: command.seats,
        title: command.title.trim() || 'Встреча команды' }] }, newId);
    }
    case 'booking-cancel':
      if (!prev || !tenantRole || !access(prev, actor) || prev.cancelled) return fail('Отмена недоступна.');
      return success(patch('bookings', record => ({ ...record, cancelled: true })));
    default:
      return fail('Неизвестное действие.');
  }
}
