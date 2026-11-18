import { createClient } from '@supabase/supabase-js';
import { createIcons, UsersRound, LayoutDashboard, ChevronRight, Bell, Plus, GraduationCap, Sparkles, Search, ArrowDown, Pencil, Trash2, ContactRound, ChevronLeft, SquarePen, UserRoundPlus, X, Check, PlugZap, ArrowRight } from 'lucide';
import './style.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasRealConfig = Boolean(supabaseUrl && supabaseKey)
  && !/your-project|your-supabase|your-key|\.\.\./i.test(`${supabaseUrl} ${supabaseKey}`);
const supabase = hasRealConfig ? createClient(supabaseUrl.trim(), supabaseKey.trim()) : null;
const programs = ['Accountancy', 'Architecture', 'Business Administration', 'Computer Science', 'Education', 'Engineering', 'Information Technology', 'Nursing', 'Psychology'];
const state = { students: [], search: '', program: '', year: '', page: 1, pageSize: 8, editing: null, loading: false };
const app = document.querySelector('#app');
const icons = () => createIcons({ icons: { UsersRound, LayoutDashboard, ChevronRight, Bell, Plus, GraduationCap, Sparkles, Search, ArrowDown, Pencil, Trash2, ContactRound, ChevronLeft, SquarePen, UserRoundPlus, X, Check, PlugZap, ArrowRight } });
const explainError = error => {
  const message = error?.message || String(error || 'Unknown error');
  if (/failed to fetch|networkerror|fetch failed/i.test(message)) return 'Hindi maabot ang Supabase. Tiyaking totoong Project URL at Publishable key ang nasa .env, naka-save ito, at na-restart ang Vite server.';
  if (/row-level security|permission denied|not allowed/i.test(message)) return 'Hinaharang ng Supabase Row Level Security (RLS) ang pag-save. Tiyaking na-enable ang tamang students policy.';
  if (/relation .*students.* does not exist|could not find the table/i.test(message)) return 'Hindi makita ang students table. Patakbuhin ang table schema sa Supabase SQL Editor.';
  return message;
};
const initials = (first, last) => `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const toast = (message, kind = 'success') => { const el = document.querySelector('.toast'); if (!el) return; el.textContent = message; el.className = `toast show ${kind}`; setTimeout(() => el.classList.remove('show'), 3000); };

function render() {
  const filtered = state.students.filter(s => {
    const q = state.search.trim().toLowerCase();
    return (!q || `${s.student_id} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q))
      && (!state.program || s.program === state.program)
      && (!state.year || String(s.year_level) === state.year);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const shown = filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
  app.innerHTML = `
    <aside class="rail"><div class="brand-mark">c<span>.</span></div><div class="rail-divider"></div><button class="rail-link active" aria-label="Students" title="Students"><i data-lucide="users-round"></i></button><button class="rail-link" aria-label="Overview" title="Overview" disabled><i data-lucide="layout-dashboard"></i></button><div class="rail-bottom"><div class="avatar admin-avatar">AD</div></div></aside>
    <main class="workspace"><header class="topbar"><div class="crumb"><span>Workspace</span><i data-lucide="chevron-right"></i><strong>Students</strong></div><div class="top-actions"><span class="term"><span class="green-dot"></span> Academic year 2025–26</span><button class="icon-btn" aria-label="Notifications"><i data-lucide="bell"></i><span class="notification-dot"></span></button><div class="avatar admin-avatar">AD</div></div></header>
      <section class="content"><div class="page-heading"><div><div class="eyebrow">DIRECTORY <span>·</span> STUDENT RECORDS</div><h1>Students</h1><p class="subtitle">Keep your student information organized and up to date.</p></div><button class="primary-btn" id="add-student"><i data-lucide="plus"></i><span>Add student</span></button></div>
      ${!supabase ? `<div class="setup-note"><span class="setup-icon"><i data-lucide="plug-zap"></i></span><div><strong>Connect your Supabase project</strong><p>Replace the sample values with your real Project URL and Publishable key in the root <code>.env</code> file. Save it, then restart the Vite server. Run <code>supabase/schema.sql</code> in Supabase if the table is not created yet.</p></div></div>` : ''}
      <div class="stat-row"><div class="stat-card"><div class="stat-label">TOTAL STUDENTS <i data-lucide="users-round"></i></div><div class="stat-value">${state.students.length}<span class="stat-caption">records in directory</span></div><div class="stat-foot"><span class="stat-accent"></span> All programs</div></div><div class="stat-card"><div class="stat-label">PROGRAMS <i data-lucide="graduation-cap"></i></div><div class="stat-value">${new Set(state.students.map(s => s.program)).size}<span class="stat-caption">represented</span></div><div class="stat-foot">Across the student body</div></div><div class="stat-card stat-note"><div class="stat-note-icon"><i data-lucide="sparkles"></i></div><div><strong>A little more organized.</strong><span>One place for every student record.</span></div><span class="note-flower">✳</span></div></div>
      <section class="directory"><div class="directory-head"><div><h2>All students <span class="count-pill">${filtered.length}</span></h2><p>A complete list of your student records.</p></div><div class="table-actions"><label class="search-box"><i data-lucide="search"></i><input id="search" type="search" placeholder="Search by name or student ID…" value="${escapeHtml(state.search)}"/><kbd>⌘ K</kbd></label><select id="program-filter" class="filter-select"><option value="">All programs</option>${[...new Set(state.students.map(s => s.program))].sort().map(p => `<option ${state.program === p ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('')}</select><select id="year-filter" class="filter-select year-filter"><option value="">All years</option>${[1,2,3,4].map(n => `<option value="${n}" ${state.year === String(n) ? 'selected' : ''}>Year ${n}</option>`).join('')}</select></div></div>
      <div class="table-wrap"><table><thead><tr><th>STUDENT <i data-lucide="arrow-down"></i></th><th>STUDENT ID</th><th>PROGRAM</th><th>YEAR LEVEL</th><th>EMAIL ADDRESS</th><th></th></tr></thead><tbody>${state.loading ? `<tr><td colspan="6" class="empty"><span class="spinner"></span><p>Loading student records…</p></td></tr>` : shown.length ? shown.map(s => `<tr><td><div class="student-cell"><div class="avatar student-avatar tone-${(s.id ?? 0) % 5}">${escapeHtml(initials(s.first_name,s.last_name))}</div><div class="student-name"><strong>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</strong><span>${escapeHtml(s.first_name.toLowerCase())}.${escapeHtml(s.last_name.toLowerCase())}@student.edu</span></div></div></td><td><span class="id-text">${escapeHtml(s.student_id)}</span></td><td><span class="program-cell"><span class="program-dot"></span>${escapeHtml(s.program)}</span></td><td><span class="year-badge">Year ${escapeHtml(s.year_level)}</span></td><td class="email-cell">${escapeHtml(s.email)}</td><td><div class="row-actions"><button class="row-action edit-btn" data-id="${s.id}" aria-label="Edit ${escapeHtml(s.first_name)}" title="Edit"><i data-lucide="pencil"></i></button><button class="row-action delete-btn" data-id="${s.id}" aria-label="Delete ${escapeHtml(s.first_name)}" title="Delete"><i data-lucide="trash-2"></i></button></div></td></tr>`).join('') : `<tr><td colspan="6" class="empty"><div class="empty-illustration"><i data-lucide="contact-round"></i></div><strong>${state.students.length ? 'No students found' : 'Your directory is ready'}</strong><p>${state.students.length ? 'Try adjusting your search or filters.' : 'Add your first student to get started.'}</p>${!state.students.length && supabase ? '<button class="text-btn" id="empty-add">Add a student <i data-lucide="arrow-right"></i></button>' : ''}</td></tr>`}</tbody></table></div>
      <div class="table-footer"><span>Showing <strong>${filtered.length ? (state.page - 1) * state.pageSize + 1 : 0}–${Math.min(state.page * state.pageSize, filtered.length)}</strong> of <strong>${filtered.length}</strong> students</span><div class="pagination"><button id="previous" ${state.page <= 1 ? 'disabled' : ''} aria-label="Previous page"><i data-lucide="chevron-left"></i></button><span>Page <strong>${state.page}</strong> of <strong>${pages}</strong></span><button id="next" ${state.page >= pages ? 'disabled' : ''} aria-label="Next page"><i data-lucide="chevron-right"></i></button></div></div></section>
      <footer class="page-footer"><span>© 2025 Campus Desk</span><span>Made for the people behind the numbers <span class="heart">♥</span></span></footer></section>
    </main><div class="toast" role="status"></div><div id="modal-root"></div>`;
  icons();
  bind();
}

function bind() {
  document.querySelector('#add-student')?.addEventListener('click', () => openForm());
  document.querySelector('#empty-add')?.addEventListener('click', () => openForm());
  document.querySelector('#search')?.addEventListener('input', e => { state.search = e.target.value; state.page = 1; const pos = e.target.selectionStart; render(); const input = document.querySelector('#search'); input.focus(); input.setSelectionRange(pos,pos); });
  document.querySelector('#program-filter')?.addEventListener('change', e => { state.program = e.target.value; state.page = 1; render(); });
  document.querySelector('#year-filter')?.addEventListener('change', e => { state.year = e.target.value; state.page = 1; render(); });
  document.querySelector('#previous')?.addEventListener('click', () => { state.page--; render(); });
  document.querySelector('#next')?.addEventListener('click', () => { state.page++; render(); });
  document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', () => openForm(state.students.find(s => String(s.id) === b.dataset.id))));
  document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', () => confirmDelete(state.students.find(s => String(s.id) === b.dataset.id))));
}

function openForm(student = null) {
  if (!supabase) return toast('Connect Supabase to add student records.', 'error');
  state.editing = student;
  const root = document.querySelector('#modal-root');
  root.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-top"><div class="modal-icon"><i data-lucide="${student ? 'square-pen' : 'user-round-plus'}"></i></div><button class="modal-close" aria-label="Close"><i data-lucide="x"></i></button></div><h2 id="modal-title">${student ? 'Edit student' : 'Add a student'}</h2><p class="modal-subtitle">${student ? 'Update this student’s information.' : 'Add someone new to your student directory.'}</p><form id="student-form" novalidate><div class="form-grid"><label class="field full"><span>Student number <b>*</b></span><input name="student_id" required maxlength="32" placeholder="e.g. 2025-00142" value="${escapeHtml(student?.student_id)}" autocomplete="off"/><small class="field-error"></small></label><label class="field"><span>First name <b>*</b></span><input name="first_name" required maxlength="80" placeholder="e.g. Alex" value="${escapeHtml(student?.first_name)}" autocomplete="given-name"/><small class="field-error"></small></label><label class="field"><span>Last name <b>*</b></span><input name="last_name" required maxlength="80" placeholder="e.g. Morgan" value="${escapeHtml(student?.last_name)}" autocomplete="family-name"/><small class="field-error"></small></label><label class="field full"><span>Email address <b>*</b></span><input name="email" type="email" required maxlength="254" placeholder="alex.morgan@university.edu" value="${escapeHtml(student?.email)}" autocomplete="email"/><small class="field-error"></small></label><label class="field full"><span>Program <b>*</b></span><select name="program" required><option value="">Select a program</option>${programs.map(p => `<option ${student?.program === p ? 'selected' : ''}>${p}</option>`).join('')}</select><small class="field-error"></small></label><label class="field full"><span>Year level <b>*</b></span><select name="year_level" required><option value="">Select year level</option>${[1,2,3,4].map(n => `<option value="${n}" ${Number(student?.year_level) === n ? 'selected' : ''}>Year ${n}</option>`).join('')}</select><small class="field-error"></small></label></div><div class="modal-footer"><span><b>*</b> Required fields</span><div><button type="button" class="secondary-btn cancel-btn">Cancel</button><button type="submit" class="primary-btn save-btn"><i data-lucide="${student ? 'check' : 'plus'}"></i>${student ? 'Save changes' : 'Add student'}</button></div></div></form></section></div>`;
  icons();
  root.querySelector('.modal-close').onclick = closeModal;
  root.querySelector('.cancel-btn').onclick = closeModal;
  root.querySelector('.modal-backdrop').addEventListener('click', e => { if (e.target.classList.contains('modal-backdrop')) closeModal(); });
  root.querySelector('form').addEventListener('submit', saveStudent);
  root.querySelector('[name="student_id"]').focus();
  document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
}

function closeModal() { document.querySelector('#modal-root').innerHTML = ''; document.onkeydown = null; }

async function saveStudent(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  for (const key of ['student_id', 'first_name', 'last_name', 'email', 'program', 'year_level']) data[key] = data[key].trim();
  const errors = { student_id: !data.student_id && 'Student number is required.', first_name: !data.first_name && 'First name is required.', last_name: !data.last_name && 'Last name is required.', email: !data.email ? 'Email address is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && 'Enter a valid email address.', program: !data.program && 'Choose a program.', year_level: !data.year_level ? 'Choose a year level.' : ![1,2,3,4].includes(Number(data.year_level)) && 'Year level must be between 1 and 4.' };
  let invalid = false;
  for (const [name, error] of Object.entries(errors)) { const input = form.elements[name]; input.classList.toggle('invalid', Boolean(error)); input.nextElementSibling.textContent = error || ''; if (error) invalid = true; }
  if (invalid) return;
  data.year_level = Number(data.year_level);
  const button = form.querySelector('[type="submit"]'); button.disabled = true; button.innerHTML = '<span class="button-spinner"></span> Saving…';
  let query = state.editing ? supabase.from('students').update(data).eq('id', state.editing.id) : supabase.from('students').insert(data);
  const { error } = await query;
  if (error) { button.disabled = false; button.innerHTML = state.editing ? '<i data-lucide="check"></i>Save changes' : '<i data-lucide="plus"></i>Add student'; icons(); toast(error.code === '23505' ? 'That student number is already in use.' : explainError(error), 'error'); return; }
  closeModal(); await loadStudents(); toast(state.editing ? 'Student details updated.' : 'Student added to the directory.');
}

function confirmDelete(student) {
  if (!student || !supabase) return;
  const root = document.querySelector('#modal-root');
  root.innerHTML = `<div class="modal-backdrop"><section class="modal confirm-modal" role="alertdialog" aria-modal="true"><div class="confirm-icon"><i data-lucide="trash-2"></i></div><h2>Delete this student?</h2><p><strong>${escapeHtml(student.first_name)} ${escapeHtml(student.last_name)}</strong> will be permanently removed from your student directory.</p><div class="confirm-actions"><button class="secondary-btn cancel-btn">Keep student</button><button class="danger-btn confirm-delete">Delete student</button></div></section></div>`;
  icons();
  root.querySelector('.cancel-btn').onclick = closeModal;
  root.querySelector('.confirm-delete').onclick = async e => { const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'Deleting…'; const { error } = await supabase.from('students').delete().eq('id', student.id); if (error) { closeModal(); toast(explainError(error), 'error'); return; } closeModal(); await loadStudents(); toast('Student record deleted.'); };
  root.querySelector('.modal-backdrop').addEventListener('click', e => { if (e.target.classList.contains('modal-backdrop')) closeModal(); });
}

async function loadStudents() {
  if (!supabase) { render(); return; }
  state.loading = true; render();
  const { data, error } = await supabase.from('students').select('id, student_id, first_name, last_name, program, year_level, email, created_at').order('created_at', { ascending: false });
  state.loading = false;
  if (error) { state.students = []; render(); toast(explainError(error), 'error'); return; }
  state.students = data || []; render();
}

render();
loadStudents();
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.querySelector('#search')?.focus(); } });

