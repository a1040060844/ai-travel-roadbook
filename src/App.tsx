import { lazy, Suspense } from "react";
import { Navigate, NavLink, Route, Routes, useParams } from "react-router-dom";
import { CalendarBlank, MapTrifold, Path, BookOpenText, NavigationArrow, WarningCircle } from "@phosphor-icons/react";
import { SceneCue } from "./components/SceneCue";
import { dayById, displayDate, facts, roadbook, todayOrNearestDay, type Day } from "./lib/roadbook";
import { navigationUrl } from "./lib/navigation";

const nav = [{ to: "/", label: "路书", icon: Path }, { to: "/today", label: "今天", icon: CalendarBlank }, { to: "/journey", label: "行程", icon: Path }, { to: "/map", label: "地图", icon: MapTrifold }, { to: "/guide", label: "工具", icon: BookOpenText }];
const TravelMap = lazy(() => import("./components/TravelMap").then((module) => ({ default: module.TravelMap })));

function MapPanel({ dayId, compact = false }: { dayId?: string; compact?: boolean }) {
  return <Suspense fallback={<div className="map-skeleton">地图组件准备中…</div>}><TravelMap dayId={dayId} compact={compact} /></Suspense>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="app" style={{ "--accent": roadbook.meta.theme.accent, "--ink": roadbook.meta.theme.ink, "--mist": roadbook.meta.theme.mist } as React.CSSProperties}>
    <header className="topbar"><NavLink className="brand" to="/"><b>{roadbook.meta.title}</b><span>{roadbook.meta.destination}</span></NavLink><nav>{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"}><Icon /><span>{label}</span></NavLink>)}</nav></header>
    <main>{children}</main>
    <nav className="bottom-nav">{nav.slice(1).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon /><span>{label}</span></NavLink>)}</nav>
  </div>;
}

function DaySummary({ day, link = true }: { day: Day; link?: boolean }) {
  const content = <article className="day-summary"><img src={day.image} alt="" /><div className="day-summary-body"><span>{day.label} · {displayDate(day.date)}</span><SceneCue scene={day.scene} /><h2>{day.title}</h2><p>{day.subtitle}</p><strong>{day.anchor}</strong></div></article>;
  return link ? <NavLink to={`/day/${day.id}`}>{content}</NavLink> : content;
}

function Home() { return <><section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,22,37,.88), rgba(8,22,37,.2)), url(${roadbook.meta.theme.heroImage})` }}><p>AI TRAVEL ROADBOOK</p><h1>{roadbook.meta.title}</h1><h2>{roadbook.meta.routeLabel}</h2><span>{roadbook.meta.dateRange}</span><p className="hero-copy">{roadbook.meta.description}</p><NavLink className="hero-action" to="/journey">查看完整行程 <NavigationArrow weight="fill" /></NavLink></section><section className="section intro"><p>目的地 · {roadbook.meta.destination}</p><h2>把攻略变成一份可走、可看、可带走的路书。</h2><span>所有信息来自本次内容包；出发前请完成事实核对。</span></section><section className="day-grid">{roadbook.days.map((day) => <DaySummary key={day.id} day={day} />)}</section></>; }

function Today() { const day = todayOrNearestDay(); return <section className="utility-page"><p className="eyebrow">TODAY · {roadbook.meta.destination}</p><h1>{day ? `${day.label} · ${day.title}` : "尚未添加行程"}</h1>{day && <><DaySummary day={day} link={false} /><DayTimeline day={day} /><MapPanel dayId={day.id} compact /></>}<p className="quiet-note">Today 仅按 {roadbook.meta.timezone} 的日期选择行程日，不根据当前时间猜测下一站。</p></section>; }

function DayTimeline({ day }: { day: Day }) { return <section className="timeline"><div className="timeline-head"><h2>当天安排</h2>{day.wake && <span>起床 {day.wake.time} · 准备 {day.wake.preparationMinutes} 分钟</span>}</div><ol>{day.stops.map((stop) => <li key={`${stop.time}-${stop.name}`}><time>{stop.time}</time><div><strong>{stop.name}</strong><p>{stop.note}</p>{stop.placeId && day.places.find((place) => place.id === stop.placeId) && <a href={navigationUrl(day.places.find((place) => place.id === stop.placeId)!)} target="_blank" rel="noreferrer">导航 <NavigationArrow weight="fill" /></a>}</div></li>)}</ol></section>; }

function DayPage() { const { id } = useParams(); const day = dayById(id); if (!day) return <Navigate to="/journey" replace />; return <section className="utility-page"><p className="eyebrow">{day.label} · {displayDate(day.date)}</p><h1>{day.title}</h1><p className="lead">{day.subtitle}</p><DaySummary day={day} link={false} /><div className="two-column"><DayTimeline day={day} /><aside className="day-aside"><h2>守住这些</h2>{day.alerts?.map((alert) => <p key={alert}><WarningCircle />{alert}</p>)}<h2>用餐策略</h2>{day.meals?.map((meal) => <div key={meal.label}><strong>{meal.label}</strong><p>{meal.strategy}</p></div>)}</aside></div><MapPanel dayId={day.id} /></section>; }

function Journey() { return <section className="utility-page"><p className="eyebrow">JOURNEY</p><h1>{roadbook.days.length} 天，完整看懂。</h1><p className="lead">{roadbook.meta.dateRange} · {roadbook.meta.routeLabel}</p><MapPanel /> <div className="journey-list">{roadbook.days.map((day) => <DaySummary key={day.id} day={day} />)}</div></section>; }

function MapPage() { return <section className="utility-page"><p className="eyebrow">MAP</p><h1>路线与地点</h1><p className="lead">路线几何来自当前内容包；未验证路径只作为明显标记的示意。</p><MapPanel /><div className="place-list">{roadbook.days.flatMap((day) => day.places.map((place) => <a key={`${day.id}-${place.id}`} href={navigationUrl(place)} target="_blank" rel="noreferrer"><span>{day.label}</span><strong>{place.name}</strong><small>{place.localName}</small></a>))}</div></section>; }

function Guide() { return <section className="utility-page"><p className="eyebrow">GUIDE</p><h1>出发前核对</h1>{facts.needsRecheck && <div className="fact-alert"><WarningCircle />内容中仍有待核对信息。请打开 `content/facts.json` 查看来源与状态。</div>}<section className="guide-list"><h2>旅行检查</h2>{roadbook.guide.checks?.map((check) => <p key={check}>{check}</p>)}<h2>使用说明</h2>{roadbook.guide.notes?.map((note) => <p key={note}>{note}</p>)}</section></section>; }

export function App() { return <Shell><Routes><Route path="/" element={<Home />} /><Route path="/today" element={<Today />} /><Route path="/journey" element={<Journey />} /><Route path="/day/:id" element={<DayPage />} /><Route path="/map" element={<MapPage />} /><Route path="/guide" element={<Guide />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Shell>; }
