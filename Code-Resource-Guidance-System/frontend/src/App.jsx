import React from "react";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Bookmark, Code2, Search, LogOut, UserRound, Shield, ArrowUpRight, GraduationCap, Menu, X, Plus, Trash2 } from 'lucide-react';
import { api, getToken } from './api';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const types = ['All', 'Article', 'Video', 'Course', 'Documentation', 'Practice'];
const languages = ['All', 'Python', 'Java', 'JavaScript', 'C++', 'SQL', 'Web Development', 'Data Structures'];

function App() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [page, setPage] = useState('home');
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('All');
  const [level, setLevel] = useState('All');
  const [type, setType] = useState('All');
  const [authMode, setAuthMode] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [adminForm, setAdminForm] = useState({ title:'', description:'', url:'', language:'Python', topic:'General', level:'Beginner', type:'Article', tags:'' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  async function loadResources() {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (language !== 'All') params.set('language', language);
      if (level !== 'All') params.set('level', level);
      if (type !== 'All') params.set('type', type);
      const data = await api(`/resources?${params.toString()}`);
      setResources(data.resources || []);
    } catch (e) { setNotice(e.message); }
  }
  async function loadBookmarks() {
    if (!getToken()) return setBookmarks([]);
    try { const d = await api('/bookmarks'); setBookmarks(d.bookmarks || []); } catch { setBookmarks([]); }
  }
  useEffect(() => { loadResources(); }, [search, language, level, type]);
  useEffect(() => {
    if (getToken()) api('/auth/me').then(d => setUser(d.user)).catch(() => { localStorage.removeItem('crgs_token'); setUser(null); });
    loadBookmarks();
  }, []);

  const bookmarkIds = useMemo(() => new Set(bookmarks.map(b => b.resource?._id).filter(Boolean)), [bookmarks]);
  const shownResources = page === 'bookmarks' ? resources.filter(r => bookmarkIds.has(r._id)) : resources;

  function openAuth(mode) { setAuthMode(mode); setAuthError(''); setAuthForm({ name:'', email:'', password:'' }); }
  async function submitAuth(e) {
    e.preventDefault(); setBusy(true); setAuthError('');
    try {
      const data = await api(`/auth/${authMode}`, { method:'POST', body:JSON.stringify(authForm) });
      localStorage.setItem('crgs_token', data.token); setUser(data.user); setAuthMode(''); await loadBookmarks(); setNotice(`Welcome ${data.user.name}!`);
    } catch (e) { setAuthError(e.message); } finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem('crgs_token'); setUser(null); setBookmarks([]); setPage('home'); setNotice('You have logged out.'); }
  async function toggleBookmark(resource) {
    if (!user) return openAuth('login');
    try {
      if (bookmarkIds.has(resource._id)) await api(`/bookmarks/${resource._id}`, { method:'DELETE' });
      else await api(`/bookmarks/${resource._id}`, { method:'POST' });
      await loadBookmarks(); setNotice(bookmarkIds.has(resource._id) ? 'Bookmark removed.' : 'Resource saved.');
    } catch(e) { setNotice(e.message); }
  }
  async function addResource(e) {
    e.preventDefault();
    try {
      await api('/resources', { method:'POST', body:JSON.stringify({ ...adminForm, tags:adminForm.tags.split(',').map(t=>t.trim()).filter(Boolean) }) });
      setAdminForm({ title:'', description:'', url:'', language:'Python', topic:'General', level:'Beginner', type:'Article', tags:'' });
      setNotice('Resource added successfully.'); await loadResources();
    } catch(e) { setNotice(e.message); }
  }
  async function deleteResource(id) {
    if (!confirm('Delete this resource permanently?')) return;
    try { await api(`/resources/${id}`, { method:'DELETE' }); setNotice('Resource deleted.'); await loadResources(); await loadBookmarks(); }
    catch(e) { setNotice(e.message); }
  }

  return <div className="app-shell">
    <header className="navbar">
      <Link className="brand" to="/" onClick={() => setPage('home')}><span className="brand-icon"><Code2 size={21}/></span><span>CRGS<span className="brand-dot">.</span></span></Link>
      <nav className={mobileOpen ? 'nav-links open' : 'nav-links'}>
        <button className={page==='home'?'nav-active':''} onClick={()=>{setPage('home');setMobileOpen(false)}}>Home</button>
        <button className={page==='resources'?'nav-active':''} onClick={()=>{setPage('resources');setMobileOpen(false)}}>Explore Resources</button>
        {user && <button className={page==='bookmarks'?'nav-active':''} onClick={()=>{setPage('bookmarks');setMobileOpen(false)}}><Bookmark size={16}/> Saved</button>}
        {user?.role==='admin' && <button className={page==='admin'?'nav-active':''} onClick={()=>{setPage('admin');setMobileOpen(false)}}><Shield size={16}/> Admin</button>}
      </nav>
      <div className="nav-actions">
        {user ? <><span className="user-chip"><UserRound size={16}/>{user.name.split(' ')[0]}</span><button className="btn btn-outline btn-small" onClick={logout}><LogOut size={15}/> Logout</button></> :
          <><button className="btn btn-ghost btn-small" onClick={()=>openAuth('login')}>Log in</button><button className="btn btn-primary btn-small" onClick={()=>openAuth('register')}>Get started</button></>}
      </div>
      <button className="mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button>
    </header>

    {notice && <div className="notice" onClick={()=>setNotice('')}>{notice}<button>×</button></div>}

    {page==='home' && <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> YOUR LEARNING, YOUR WAY</div>
          <h1>Find the right resources.<br/><span>Build your future.</span></h1>
          <p>Discover hand-picked coding tutorials, courses, documentation and practice material—matched to your skills and goals.</p>
          <div className="hero-buttons"><button className="btn btn-primary btn-lg" onClick={()=>setPage('resources')}>Explore resources <ArrowUpRight size={18}/></button><button className="btn btn-outline btn-lg" onClick={()=>openAuth('register')}>Create free account</button></div>
          <div className="hero-trust"><span><BookOpen size={15}/> Learning resources</span><span><GraduationCap size={15}/> All skill levels</span></div>
        </div>
        <div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="code-card"><div className="code-top"><span/><span/><span/><label>your_learning.py</label></div><div className="code-lines"><p><i>01</i> <b>def</b> <em>learn_to_code</em>():</p><p><i>02</i> &nbsp;&nbsp;skills = <strong>['curiosity']</strong></p><p><i>03</i> &nbsp;&nbsp;<b>while</b> skills:</p><p><i>04</i> &nbsp;&nbsp;&nbsp;&nbsp;practice()</p><p><i>05</i> &nbsp;&nbsp;&nbsp;&nbsp;skills.<em>grow</em>()</p><p><i>06</i> &nbsp;&nbsp;<b>return</b> success</p></div><div className="code-footer"><span className="live-dot"/> Keep learning. Keep building.</div></div><div className="floating-tag tag-one"><span className="tag-emoji">🐍</span><div><b>Python</b><small>Beginner friendly</small></div></div><div className="floating-tag tag-two"><span className="tag-emoji">⚡</span><div><b>Personalized</b><small>Learning paths</small></div></div></div>
      </section>
      <section className="stats"><div><strong>Curated</strong><span>Useful learning material</span></div><div><strong>7+ Topics</strong><span>Explore popular technologies</span></div><div><strong>3 Levels</strong><span>Learn at your own pace</span></div><div><strong>Free to use</strong><span>Student-first platform</span></div></section>
      <section className="section"><div className="section-heading"><div><div className="eyebrow">START EXPLORING</div><h2>Popular learning paths</h2><p>Choose a topic and find resources to help you get started.</p></div><button className="text-link" onClick={()=>setPage('resources')}>View all resources <ArrowUpRight size={17}/></button></div>
        <div className="path-grid">{[['Python','🐍','Start with the fundamentals and grow your Python skills.','Python'],['Web Development','🌐','Learn HTML, CSS, JavaScript and modern web tools.','Web Development'],['Data Structures','🧩','Strengthen your problem-solving foundations.','Data Structures'],['Java','☕','Explore Java basics, OOP and application development.','Java']].map(([title,emoji,desc,lang])=><button className="path-card" key={title} onClick={()=>{setLanguage(lang);setPage('resources')}}><span className="path-icon">{emoji}</span><h3>{title}</h3><p>{desc}</p><span className="path-arrow">Explore <ArrowUpRight size={16}/></span></button>)}</div>
      </section>
      <section className="cta"><div><h2>Your next skill starts here.</h2><p>Build a learning habit—one resource at a time.</p></div><button className="btn btn-white" onClick={()=>setPage('resources')}>Browse library <ArrowUpRight size={17}/></button></section>
    </main>}

    {(page==='resources'||page==='bookmarks') && <main className="content-page"><div className="page-title"><div className="eyebrow">RESOURCE LIBRARY</div><h1>{page==='bookmarks'?'Your saved resources':'Explore coding resources'}</h1><p>Filter the library to find the material that fits your learning goals.</p></div>
      <div className="filter-panel"><div className="search-box"><Search size={18}/><input placeholder="Search by title, topic, language..." value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(x=><option key={x}>{x}</option>)}</select><select value={level} onChange={e=>setLevel(e.target.value)}>{levels.map(x=><option key={x}>{x}</option>)}</select><select value={type} onChange={e=>setType(e.target.value)}>{types.map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="results-line"><b>{shownResources.length} resources</b><span>Choose a resource to open it in a new tab.</span></div>
      {shownResources.length===0?<div className="empty-state"><BookOpen size={35}/><h3>No resources found</h3><p>Try changing the filters, or ask an administrator to add resources.</p></div>:<div className="resource-grid">{shownResources.map(r=><ResourceCard key={r._id} resource={r} saved={bookmarkIds.has(r._id)} onBookmark={()=>toggleBookmark(r)} admin={user?.role==='admin'} onDelete={()=>deleteResource(r._id)}/>)}</div>}
    </main>}

    {page==='admin' && user?.role==='admin' && <main className="content-page"><div className="page-title"><div className="eyebrow">ADMIN PANEL</div><h1>Manage resources</h1><p>Add learning resources to the CRGS library. Your additions are available to students.</p></div><div className="admin-layout"><form className="admin-form" onSubmit={addResource}><h2><Plus size={20}/> Add a resource</h2><label>Resource title<input required value={adminForm.title} onChange={e=>setAdminForm({...adminForm,title:e.target.value})}/></label><label>Description<textarea required rows="3" value={adminForm.description} onChange={e=>setAdminForm({...adminForm,description:e.target.value})}/></label><label>Resource URL<input required type="url" placeholder="https://..." value={adminForm.url} onChange={e=>setAdminForm({...adminForm,url:e.target.value})}/></label><div className="form-row"><label>Language<select value={adminForm.language} onChange={e=>setAdminForm({...adminForm,language:e.target.value})}>{languages.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label><label>Topic<input value={adminForm.topic} onChange={e=>setAdminForm({...adminForm,topic:e.target.value})}/></label></div><div className="form-row"><label>Level<select value={adminForm.level} onChange={e=>setAdminForm({...adminForm,level:e.target.value})}>{levels.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label><label>Type<select value={adminForm.type} onChange={e=>setAdminForm({...adminForm,type:e.target.value})}>{types.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label></div><label>Tags (comma separated)<input value={adminForm.tags} onChange={e=>setAdminForm({...adminForm,tags:e.target.value})} placeholder="basics, loops, tutorial"/></label><button className="btn btn-primary" type="submit">Publish resource</button></form><div className="admin-list"><h2>Library resources <span>{resources.length}</span></h2>{resources.map(r=><div className="admin-resource" key={r._id}><div><b>{r.title}</b><small>{r.language} · {r.level}</small></div><button className="icon-button danger" onClick={()=>deleteResource(r._id)} title="Delete resource"><Trash2 size={17}/></button></div>)}</div></div></main>}

    <footer className="footer"><div className="footer-brand"><span className="brand-icon"><Code2 size={18}/></span><b>CRGS.</b></div><p>Helping students navigate their coding journey.</p><span>© {new Date().getFullYear()} Code Resource Guidance System</span></footer>

    {authMode && <div className="modal-backdrop" onClick={()=>setAuthMode('')}><div className="auth-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAuthMode('')}><X/></button><div className="auth-logo"><Code2/></div><h2>{authMode==='login'?'Welcome back':'Create your account'}</h2><p>{authMode==='login'?'Log in to save resources and continue learning.':'Join CRGS and organize your learning journey.'}</p><form onSubmit={submitAuth}>{authMode==='register'&&<label>Full name<input required value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength={authMode==='register'?8:1} type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder={authMode==='register'?'At least 8 characters':'Your password'}/></label>{authError&&<div className="form-error">{authError}</div>}<button className="btn btn-primary full" disabled={busy}>{busy?'Please wait...':authMode==='login'?'Log in':'Create account'}</button></form><div className="auth-switch">{authMode==='login'?"Don't have an account?":'Already have an account?'} <button onClick={()=>openAuth(authMode==='login'?'register':'login')}>{authMode==='login'?'Sign up':'Log in'}</button></div></div></div>}
  </div>;
}

function ResourceCard({resource,saved,onBookmark,admin,onDelete}) {
  const icon = ({Python:'🐍',Java:'☕',JavaScript:'⚡', 'Web Development':'🌐','C++':'💻',SQL:'🗄️','Data Structures':'🧩'})[resource.language] || '📚';
  return <article className="resource-card"><div className="resource-top"><span className="resource-emoji">{icon}</span><span className={`level-pill ${resource.level.toLowerCase()}`}>{resource.level}</span></div><div className="resource-meta">{resource.language} <span>·</span> {resource.type}</div><h3>{resource.title}</h3><p>{resource.description}</p><div className="tag-row">{resource.topic&&<span>{resource.topic}</span>}{(resource.tags||[]).slice(0,2).map(t=><span key={t}>{t}</span>)}</div><div className="resource-actions"><a className="btn btn-primary btn-small" href={resource.url} target="_blank" rel="noreferrer">Open resource <ArrowUpRight size={15}/></a><button className={`icon-button ${saved?'saved':''}`} onClick={onBookmark} title={saved?'Remove bookmark':'Save resource'}><Bookmark size={17} fill={saved?'currentColor':'none'}/></button>{admin&&<button className="icon-button danger" onClick={onDelete} title="Delete resource"><Trash2 size={17}/></button>}</div></article>;
}
export default App;
