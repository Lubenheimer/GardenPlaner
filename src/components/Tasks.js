import { store } from '../core/Store.js';
import { formatDate } from '../utils/helpers.js';

export function renderTasks() {
  const container = document.getElementById('tasks-content');
  const tasks = store.getTasks();

  container.innerHTML = `
    <div class="dashboard-section animate-in" style="margin-top: 24px; max-width: 800px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2>📝 Meine Aufgaben</h2>
        <button id="add-task-btn" class="btn btn-primary">+ Aufgabe hinzufügen</button>
      </div>

      <div class="list-group" style="display: flex; flex-direction: column; gap: 8px;">
        ${tasks.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <div class="empty-text">Alles erledigt! Keine Aufgaben vorhanden.</div>
          </div>
        ` : tasks.sort((a,b) => {
             // sort by incomplete first, then date
             if (a.completed !== b.completed) return a.completed ? 1 : -1;
             return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
           }).map(t => `
            <div class="list-item ${t.completed ? 'completed' : ''}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-surface); border: var(--glass-border); border-radius: var(--radius-md); opacity: ${t.completed ? '0.6' : '1'};">
              <div style="display: flex; gap: 16px; align-items: center;">
                <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                <div>
                  <div style="font-weight: 600; font-size: 16px; text-decoration: ${t.completed ? 'line-through' : 'none'};">${t.title}</div>
                  ${t.dueDate ? `<div style="font-size: 12px; color: var(--color-danger); margin-top: 4px;">📅 Bis: ${formatDate(t.dueDate)}</div>` : ''}
                </div>
              </div>
              <button class="icon-btn small delete-task-btn" data-id="${t.id}" style="color: var(--color-danger);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
           `).join('')
        }
      </div>
    </div>
  `;

  // Bind Events
  setTimeout(() => {
    document.getElementById('add-task-btn')?.addEventListener('click', () => {
      const title = prompt('Welche Aufgabe steht an?');
      if (!title) return;
      const dueDate = prompt('Bis wann? (Format: YYYY-MM-DD) – Optional', new Date().toISOString().split('T')[0]);
      
      store.addTask({ title, dueDate: dueDate || null });
      renderTasks();
    });

    document.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const completed = e.target.checked;
        store.updateTask(id, { completed });
        renderTasks();
      });
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Aufgabe wirklich löschen?')) {
          store.deleteTask(id);
          renderTasks();
        }
      });
    });
  }, 0);
}
