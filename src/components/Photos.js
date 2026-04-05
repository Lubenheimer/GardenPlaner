/**
 * Photos — Photo upload and management view
 */
import { store } from '../core/Store.js';
import { bus } from '../core/EventBus.js';
import { formatDate, compressImage } from '../utils/helpers.js';

export function renderPhotos() {
  const container = document.getElementById('photos-content');
  const photos = store.getPhotos();
  const beds = store.getBeds();

  container.innerHTML = `
    <!-- Upload area -->
    <div class="upload-area animate-in" id="photo-upload-area">
      <div class="upload-icon">📸</div>
      <div class="upload-text">
        <strong>Klicken</strong> oder Bilder hierher ziehen
      </div>
      <input type="file" id="photo-file-input" accept="image/*" multiple style="display:none">
    </div>

    <!-- Filter -->
    ${beds.length > 0 ? `
      <div style="margin-top: var(--space-lg); display: flex; gap: var(--space-sm); align-items: center;" class="animate-in">
        <label class="form-label" style="margin: 0; white-space: nowrap;">Filtern nach Beet:</label>
        <select class="form-select" id="photo-filter-select" style="max-width: 200px;">
          <option value="">Alle Fotos</option>
          ${beds.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
        </select>
      </div>
    ` : ''}

    <!-- Photo grid -->
    <div id="photo-grid-container" style="margin-top: var(--space-lg);">
      ${renderPhotoGrid(photos, beds)}
    </div>
  `;

  // Upload area click
  const uploadArea = document.getElementById('photo-upload-area');
  const fileInput = document.getElementById('photo-file-input');

  uploadArea.addEventListener('click', () => fileInput.click());

  // Drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  // File input
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  // Filter
  document.getElementById('photo-filter-select')?.addEventListener('change', (e) => {
    const bedId = e.target.value;
    const filtered = bedId ? store.getPhotos(bedId) : store.getPhotos();
    document.getElementById('photo-grid-container').innerHTML = renderPhotoGrid(filtered, beds);
    bindPhotoEvents();
  });

  bindPhotoEvents();
}

function renderPhotoGrid(photos, beds) {
  if (photos.length === 0) {
    return `
      <div class="empty-state animate-in">
        <div class="empty-icon">🖼️</div>
        <div class="empty-text">Noch keine Fotos. Lade Bilder hoch, um sie deinen Beeten zuzuordnen.</div>
      </div>
    `;
  }

  return `
    <div class="photo-grid animate-in">
      ${photos.map(photo => {
        const bed = photo.bedId ? store.getBed(photo.bedId) : null;
        return `
          <div class="photo-card" data-photo-id="${photo.id}">
            <img src="${photo.dataUrl}" alt="${photo.caption || 'Garten-Foto'}" loading="lazy">
            <div class="photo-card-overlay">
              <div class="photo-bed-name">${bed ? bed.name : 'Nicht zugeordnet'}</div>
              <div class="photo-date">${formatDate(photo.takenAt)}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function bindPhotoEvents() {
  document.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      showPhotoDetail(card.dataset.photoId);
    });
  });
}

async function handleFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = await compressImage(e.target.result);
      const photo = store.addPhoto({
        dataUrl,
        caption: file.name.replace(/\.[^.]+$/, ''),
      });
      // Show assign modal
      showAssignModal(photo.id);
    };
    reader.readAsDataURL(file);
  }
}

function showAssignModal(photoId) {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');
  const beds = store.getBeds();
  const photo = store.getPhotos().find(p => p.id === photoId);

  container.innerHTML = `
    <div class="modal-header">
      <h2>Foto zuordnen</h2>
      <button class="icon-btn" id="modal-close-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      ${photo ? `
        <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: var(--space-md); max-height: 200px;">
          <img src="${photo.dataUrl}" style="width: 100%; object-fit: cover;">
        </div>
      ` : ''}
      <div class="form-group">
        <label class="form-label">Beet zuordnen</label>
        <select class="form-select" id="assign-bed-select">
          <option value="">— Nicht zuordnen —</option>
          ${beds.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Beschreibung</label>
        <input type="text" class="form-input" id="assign-caption-input" placeholder="Optionale Beschreibung..." value="${photo?.caption || ''}">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="modal-cancel-btn">Überspringen</button>
      <button class="btn btn-primary" id="modal-save-btn">Speichern</button>
    </div>
  `;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('visible'), 10);

  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      overlay.classList.add('hidden');
      renderPhotos();
    }, 250);
  };

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const bedId = document.getElementById('assign-bed-select').value || null;
    const caption = document.getElementById('assign-caption-input').value;
    store.updatePhoto(photoId, { bedId, caption });
    closeModal();
  });
}

function showPhotoDetail(photoId) {
  const photo = store.getPhotos().find(p => p.id === photoId);
  if (!photo) return;

  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');
  const beds = store.getBeds();
  const currentBed = photo.bedId ? store.getBed(photo.bedId) : null;

  container.innerHTML = `
    <div class="modal-header">
      <h2>Foto-Details</h2>
      <button class="icon-btn" id="modal-close-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: var(--space-md);">
        <img src="${photo.dataUrl}" style="width: 100%; object-fit: contain; max-height: 400px;">
      </div>
      <div class="form-group">
        <label class="form-label">Beet</label>
        <select class="form-select" id="detail-bed-select">
          <option value="">— Nicht zugeordnet —</option>
          ${beds.map(b => `<option value="${b.id}" ${b.id === photo.bedId ? 'selected' : ''}>${b.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Beschreibung</label>
        <input type="text" class="form-input" id="detail-caption-input" value="${photo.caption || ''}">
      </div>
      <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
        Hochgeladen: ${formatDate(photo.createdAt)}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-danger btn-sm" id="photo-delete-btn">Löschen</button>
      <button class="btn btn-ghost" id="modal-cancel-btn">Schließen</button>
      <button class="btn btn-primary" id="modal-save-btn">Speichern</button>
    </div>
  `;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('visible'), 10);

  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => {
      overlay.classList.add('hidden');
      renderPhotos();
    }, 250);
  };

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('modal-save-btn').addEventListener('click', () => {
    store.updatePhoto(photoId, {
      bedId: document.getElementById('detail-bed-select').value || null,
      caption: document.getElementById('detail-caption-input').value,
    });
    closeModal();
  });

  document.getElementById('photo-delete-btn').addEventListener('click', () => {
    store.deletePhoto(photoId);
    closeModal();
  });
}
