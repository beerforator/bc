import { useEffect, useRef, useState } from 'react';
import { offices } from './model.js';
import { asset, Brand, Button, DetailList, Icon, Modal } from './ui.jsx';

const nav = [['about', 'О здании'], ['offices', 'Офисы'], ['gallery', 'Галерея'], ['arrival', 'Как добраться']];
const galleryItems = [
  ['facade.webp', 'Фасад здания'], ['lobby.webp', 'Атриум и ресепшен'],
  ['office-405.webp', 'Рабочее пространство'], ['orion.webp', 'Переговорная «Орион»'],
];
const visitTimes = ['12:30', '14:00', '16:30'];
function plural(n) {
  return n === 1 ? 'офис' : 'офиса';
}
function jump(id) {
  const section = document.getElementById(id);
  section?.scrollIntoView({ block: 'start' });
  section?.focus({ preventScroll: true });
}
function Gallery() {
  const [index, setIndex] = useState(0);
  const touch = useRef(null);
  const move = delta => setIndex(i => (i + delta + galleryItems.length) % galleryItems.length);
  const [image, title] = galleryItems[index];
  return <section id="gallery" tabIndex={-1} className="public-section frame">
    <div className="section-title"><h2>Галерея</h2><span>{index + 1} / {galleryItems.length}</span></div>
    <figure className="gallery">
      <div className="gallery-stage" onTouchStart={e => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={e => { if (touch.current !== null) {
          const delta = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
          touch.current = null;
        } }}>
        {galleryItems.map(([file, caption], i) => <img key={file} src={asset(file)} alt={i === index ? caption : ''}
          aria-hidden={i !== index} className={`${i === index ? 'is-active' : ''} ${file === 'facade.webp' ? 'gallery-facade' : ''}`} loading="lazy" />)}
      </div>
      <figcaption><b>{title}</b><div className="icon-group">
        <Button icon="left" variant="outline" aria-label="Предыдущее фото" onClick={() => move(-1)} />
        <Button icon="right" variant="outline" aria-label="Следующее фото" onClick={() => move(1)} />
      </div></figcaption>
    </figure>
  </section>;
}
function FloorPlan({ office }) {
  const large = office.seats > 6;
  const desks = Array.from({ length: office.seats }, (_, index) => ({
    x: 28 + (index % 6) * 30, y: 37 + Math.floor(index / 6) * 24,
  }));
  return <figure className="floor-plan">
    <svg viewBox="0 0 280 140" role="img" aria-label={`План офиса ${office.id}`}>
      <path d={large ? 'M12 14H268V126H12V14M220 14V95M220 95h48' : 'M12 14H268V126H12V14M220 14V88'} fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="229" y="37" width="27" height="35" rx="4" className="plan-desk" />
      {desks.map(({ x, y }, i) => <rect key={i} x={x} y={y} width="21" height="14" rx="2" className="plan-desk" />)}
      {large && <rect x="229" y="102" width="27" height="12" rx="4" className="plan-desk" />}
      <text x="25" y="113" fill="currentColor" fontSize="11">Вход</text>
    </svg>
    <figcaption>План офиса {office.id} · {office.area} м²</figcaption>
  </figure>;
}
function OfficeDetail({ office, close }) {
  const [photo, setPhoto] = useState(true);
  const [schedule, setSchedule] = useState(false);
  const [picked, setPicked] = useState('');
  return <Modal wide title={`Офис ${office.id}`} eyebrow="Свободное помещение" onClose={close}>
    <div className="office-detail">
      <div>
        <div className="tabs" aria-label="Фото и планировка">
          <button aria-pressed={photo} onClick={() => setPhoto(true)}>Фото</button>
          <button aria-pressed={!photo} onClick={() => setPhoto(false)}>Планировка</button>
        </div>
        {photo ? <img className="office-detail-img" src={asset(`office-${office.id}.webp`)} alt={`Интерьер офиса ${office.id}`} /> : <FloorPlan office={office} />}
      </div>
      <div className="flow">
        <p>{office.description}</p>
        <DetailList items={[[ 'Площадь', `${office.area} м²`], ['Вместимость', `${office.seats} человек`], ['Этаж', office.floor]]} />
        {!schedule ? <Button onClick={() => setSchedule(true)}>Подобрать время просмотра</Button> : <>
          <h3>Время просмотра</h3>
          <div className="slot-list">{visitTimes.map(value => <Button key={value} variant={picked === value ? 'primary' : 'outline'}
            aria-pressed={picked === value} onClick={() => setPicked(value)}>{value}</Button>)}</div>
          {picked && <p className="notice" role="status">Офис {office.id} · просмотр в {picked}</p>}
        </>}
        <small>Демонстрационный подбор. Заявка не отправляется.</small>
      </div>
    </div>
  </Modal>;
}
const heroSlides = [
  { image: 'facade.webp', label: 'Архитектура с характером', title: <>Пространство<br />для ваших идей.</>, description: 'Меридиан. Светлые офисы, продуманные пространства и всё необходимое для рабочего дня.' },
  { image: 'office-405.webp', label: 'Пространство для вашей команды', title: <>Новый взгляд<br />на рабочий день.</>, description: 'Офисы для команд от 6 до 18 человек. Выберите пространство, в котором удобно работать вместе.' },
  { image: 'lobby.webp', label: 'Всё начинается со встречи', title: <>Добро пожаловать<br />в Меридиан.</>, description: 'Ресепшен, переговорные и сервисы здания. Заботу о повседневных вопросах берёт на себя команда бизнес-центра.' },
];
function Hero({ login }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touch = useRef(null);
  const move = delta => setSlide(value => (value + delta + heroSlides.length) % heroSlides.length);
  useEffect(() => {
    if (paused || hovered || focused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => { if (!document.hidden) move(1); }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, slide]);
  return <section className="facade" aria-label="Знакомство с Меридианом" aria-roledescription="карусель"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => {
      if (touch.current !== null && Math.abs(e.changedTouches[0].clientX - touch.current) > 50) move(e.changedTouches[0].clientX < touch.current ? 1 : -1);
      touch.current = null;
    }}>
    <div className="hero-images">{heroSlides.map((item, index) => <img key={item.image} src={asset(item.image)} alt="" className={index === slide ? 'is-active' : ''} fetchPriority={index === 0 ? 'high' : 'auto'} />)}</div>
    <div className="frame facade-copy">
      <div className="hero-copy" key={slide}><span className="hero-eyebrow">{heroSlides[slide].label}</span><h1>{heroSlides[slide].title}</h1><p>{heroSlides[slide].description}</p></div>
      <div className="row"><Button onClick={() => jump('offices')}>Выбрать офис</Button><Button variant="hero" onClick={login}>Кабинет резидента</Button></div>
    </div>
    <div className="hero-bottom frame"><span>Бизнес-центр «Меридиан»</span><div className="hero-pagination" role="group" aria-label="Слайды">
      {heroSlides.map((item, index) => <button key={item.image} aria-label={`Слайд ${index + 1}: ${item.label}`} aria-pressed={slide === index} onClick={() => setSlide(index)}><span /></button>)}
      <button className="hero-pause" aria-label={paused ? 'Продолжить слайдер' : 'Приостановить слайдер'} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'}</button>
    </div><div className="icon-group"><Button icon="left" variant="hero" aria-label="Предыдущий слайд" onClick={() => move(-1)} /><Button icon="right" variant="hero" aria-label="Следующий слайд" onClick={() => move(1)} /></div></div>
  </section>;
}
export function PublicPage({ login }) {
  const pageRef = useRef(null);
  useEffect(() => {
    const root = pageRef.current;
    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      root.style.setProperty('--hero-progress', Math.min(1, Math.max(0, window.scrollY / 280)));
      root.classList.toggle('is-scrolled', window.scrollY > 16);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateScroll); };
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.18, rootMargin: '0px 0px -70px 0px' });
    root.querySelectorAll('.office-pick .section-title, .office-filters, .office-card, .public-section > .section-title, .building-features article, .gallery, .arrival-inner, .public-footer').forEach(element => {
      element.classList.add('reveal'); observer.observe(element);
    });
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  const [menu, setMenu] = useState(false);
  const [area, setArea] = useState(30);
  const [seats, setSeats] = useState(1);
  const [office, setOffice] = useState(null);
  const results = offices.filter(item => item.area >= area && item.seats >= seats);
  const reset = () => { setArea(30); setSeats(1); };
  return <div className="public-page" ref={pageRef}>
    <header className="public-head">
      <div className="frame public-head-inner">
        <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} />
        <nav className={menu ? 'anchors anchors--open' : 'anchors'} aria-label="Страница здания">
          {nav.map(([id, label]) => <button key={id} onClick={() => { setMenu(false); requestAnimationFrame(() => jump(id)); }}>{label}</button>)}
        </nav>
        <Button variant="outline" onClick={login}>Войти в кабинет</Button>
        <Button className="anchor-menu" variant="quiet" aria-label="Разделы сайта" aria-expanded={menu} icon={menu ? 'close' : 'menu'} onClick={() => setMenu(!menu)} />
      </div>
    </header>
    <main>
      <div className="hero-scroll"><div className="hero-sticky"><Hero login={login} /></div></div>
      <div className="building-strip frame"><span><Icon name="building" />Офисы для команд 6–18 человек</span><span><Icon name="calendar" />Переговорные в вашем кабинете</span><span><Icon name="shield" />Ресепшен и контроль доступа</span></div>
      <section id="offices" tabIndex={-1} className="office-pick">
        <div className="frame">
          <div className="section-title"><h2>Подберите офис</h2><span aria-live="polite">{results.length ? `${results.length} ${plural(results.length)}` : 'Подходящих офисов нет'}</span></div>
          <div className="office-filters">
            <label htmlFor="office-area">Площадь от <b>{area} м²</b><input id="office-area" aria-label="Минимальная площадь, м²" type="range" min="30" max="160" value={area} onChange={e => setArea(+e.target.value)} /><span className="range-ticks" aria-hidden="true">{[30, 60, 90, 120, 160].map(n => <span key={n} style={{left: `${(n - 30) / 130 * 100}%`}}>{n}</span>)}</span></label>
            <label htmlFor="office-seats">Команда от <b>{seats} чел.</b><input id="office-seats" aria-label="Размер команды" type="range" min="1" max="20" value={seats} onChange={e => setSeats(+e.target.value)} /><span className="range-ticks" aria-hidden="true">{[1, 5, 10, 15, 20].map(n => <span key={n} style={{left: `${(n - 1) / 19 * 100}%`}}>{n}</span>)}</span></label>
            <Button variant="outline" onClick={reset} disabled={area === 30 && seats === 1}>Сбросить фильтры</Button>
          </div>
          {results.length ? <div className="office-grid">
            {results.map(item => <article className="office-card" key={item.id}>
              <img src={asset(`office-${item.id}.webp`)} alt={`Офис ${item.id}`} loading="lazy" />
              <div><h3>Офис {item.id} <span>· {item.area} м²</span></h3><p>{item.floor} этаж · до {item.seats} человек</p>
                <Button variant="text" icon="arrow" onClick={() => setOffice(item)}>Посмотреть офис {item.id}</Button></div>
            </article>)}
          </div> : <div className="empty-state"><h3>Нет помещений с такими параметрами</h3><p>Уменьшите минимальную площадь или размер команды.</p><Button onClick={reset}>Показать все офисы</Button></div>}
        </div>
      </section>
      <section id="about" tabIndex={-1} className="public-section frame">
        <div className="section-title"><h2>О здании</h2></div>
        <div className="building-features">
          <article><Icon name="pin" /><h3>Главный вход</h3><p>Ресепшен в вестибюле первого этажа. Здесь гостей встречают и направляют в офис.</p></article>
          <article><Icon name="calendar" /><h3>Переговорные</h3><p>«Орион» на втором и «Вега» на пятом этаже. Интервалы видны в кабинете.</p></article>
          <article><Icon name="parking" /><h3>Подземная парковка</h3><p>Уровень P1, закреплённые места и зона разгрузки для доставки.</p></article>
        </div>
      </section>
      <Gallery />
    </main>
    <footer id="arrival" tabIndex={-1} className="arrival">
      <div className="frame arrival-inner">
        <h2>Как добраться</h2>
        <div>
          <p className="arrival-direction">Главный вход <Icon name="arrow" /> Ресепшен</p>
          <p>Стойка ресепшена работает с 08:00 до 20:00.</p>
        </div>
      </div>
      <div className="frame public-footer">
        <div className="footer-identity"><Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} /><p>Пространство для ваших идей.<br />Офисы, встречи и сервисы в одном месте.</p><small>© 2026 Бизнес-центр «Меридиан»</small></div>
        <div className="footer-column"><h3>Бизнес-центр</h3>{nav.map(([id, label]) => <button key={id} onClick={() => jump(id)}>{label}</button>)}</div>
        <div className="footer-column"><h3>Социальные сети</h3>{['Telegram', 'ВКонтакте', 'Дзен'].map(title => <a href="" key={title} onClick={e => e.preventDefault()}>{title}</a>)}</div>
        <div className="footer-column"><h3>Информация</h3>{['Политика конфиденциальности', 'Обработка персональных данных', 'Пользовательское соглашение'].map(title => <a href="" key={title} onClick={e => e.preventDefault()}>{title}</a>)}<a href={asset('photo-credits.html')}>Источники фотографий</a></div>
      </div>
    </footer>
    {office && <OfficeDetail office={office} close={() => setOffice(null)} />}
  </div>;
}
export function Login({ openDemo, portal }) {
  return <main className="login">
    <section className="surface login-card">
      <Brand onClick={portal} />
      <h1>Вход в кабинет</h1>
      <p>Кабинет доступен сотрудникам по приглашению компании.</p>
      <Button onClick={openDemo}>Выбрать демороль</Button>
      <Button variant="text" onClick={portal}>На страницу БЦ</Button>
    </section>
  </main>;
}
