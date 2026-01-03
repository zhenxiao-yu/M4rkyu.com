import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './AdminPage.css';
import { sections as predefinedSections } from '../../assets/data/GalleryData';
import useFirestore from '../../hooks/useFirebase';
import {
  bulkUpdateSection,
  createImage,
  deleteImage,
  deleteImagesBulk,
  updateImage,
  updateOrder,
} from '../../services/galleryService';
import { uploadWithLimit } from '../../services/storageService';

const sectionOptions = predefinedSections.map((s) => s.header);

const emptyDraft = {
  section: sectionOptions[0] || '',
  title: '',
  description: '',
  tags: '',
  alt: '',
  location: '',
  dateTaken: '',
};

const AdminPage = () => {
  const { docs, error } = useFirestore('images');
  const [localImages, setLocalImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterSection, setFilterSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editorTarget, setEditorTarget] = useState(null);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setLocalImages(docs);
  }, [docs]);

  const filteredImages = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return localImages.filter((img) => {
      const matchesSection = filterSection ? img.section === filterSection : true;
      const matchesSearch = needle
        ? `${img.title || ''} ${img.description || ''} ${img.tags?.join(' ') || ''}`.toLowerCase().includes(needle)
        : true;
      return matchesSection && matchesSearch;
    });
  }, [localImages, filterSection, searchTerm]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(filteredImages.map((img) => img.id));
  }, [filteredImages]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const handleDelete = async (ids) => {
    const confirmation = prompt('Type DELETE to remove selected images and their storage objects.');
    if (confirmation !== 'DELETE') return;
    const targets = localImages.filter((img) => ids.includes(img.id));
    await deleteImagesBulk(targets);
    setStatusMessage('Images deleted successfully.');
    clearSelection();
  };

  const handleSingleDelete = async (img) => {
    const confirmation = prompt(`Type DELETE to remove ${img.title || 'this image'}.`);
    if (confirmation !== 'DELETE') return;
    await deleteImage(img.id, img.storagePath);
    setStatusMessage('Image deleted successfully.');
  };

  const handleBulkMove = async (section) => {
    if (!section || !selectedIds.length) return;
    await bulkUpdateSection(selectedIds, section);
    setStatusMessage('Section updated for selected images.');
    clearSelection();
  };

  const handleEditSave = async (payload) => {
    if (!payload.alt?.trim()) {
      alert('Alt text is required for accessibility.');
      return;
    }
    await updateImage(payload.id, {
      title: payload.title,
      description: payload.description,
      section: payload.section,
      alt: payload.alt,
      tags: payload.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) || [],
      location: payload.location,
      dateTaken: payload.dateTaken,
    });
    setEditorTarget(null);
    setStatusMessage('Image updated successfully.');
  };

  const handleDraftChange = (index, field, value) => {
    setPendingDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const saveDrafts = async () => {
    for (const draft of pendingDrafts) {
      if (!draft.alt.trim()) {
        alert('Alt text is required for every uploaded image.');
        return;
      }
    }
    for (const draft of pendingDrafts) {
      const tags = draft.tags ? draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
      await createImage({
        imageUrl: draft.imageUrl,
        storagePath: draft.storagePath,
        section: draft.section,
        title: draft.title || 'Untitled',
        description: draft.description,
        alt: draft.alt,
        tags,
        location: draft.location,
        dateTaken: draft.dateTaken,
        order: draft.order,
        width: draft.width,
        height: draft.height,
      });
    }
    setPendingDrafts([]);
    setStatusMessage('Uploads saved.');
  };

  const handleReorder = async (draggedId, targetId) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    setIsReordering(true);
    let reordered = [];
    setLocalImages((prev) => {
      const next = [...prev];
      const draggedIndex = next.findIndex((img) => img.id === draggedId);
      const targetIndex = next.findIndex((img) => img.id === targetId);
      const dragged = next[draggedIndex];
      if (dragged.section !== next[targetIndex].section) return prev;
      next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, dragged);
      const perSectionOrder = {};
      reordered = next.map((img) => {
        const currentIndex = (perSectionOrder[img.section] || 0) + 1;
        perSectionOrder[img.section] = currentIndex;
        return { ...img, order: currentIndex };
      });
      return reordered;
    });
    const updates = (reordered.length ? reordered : filteredImages).map((img) => ({
      id: img.id,
      order: img.order || 0,
      section: img.section,
    }));
    await updateOrder(updates);
    setIsReordering(false);
    setStatusMessage('Order updated.');
  };

  const onDropFiles = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    if (!files.length) return;
    await startUploads(files);
  };

  const onInputFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    await startUploads(files);
  };

  const startUploads = async (files) => {
    setStatusMessage('Uploading files...');
    const statuses = {};
    setUploadStatuses({});
    const results = await uploadWithLimit(files, (file, status) => {
      statuses[file.name] = status;
      setUploadStatuses({ ...statuses });
    });
    const drafts = results.map((res, index) => ({
      ...emptyDraft,
      section: filterSection || sectionOptions[0] || '',
      title: res.file.name.replace(/\.[^.]+$/, ''),
      alt: `Photo: ${res.file.name.replace(/\.[^.]+$/, '')}`,
      imageUrl: res.imageUrl,
      storagePath: res.storagePath,
      width: res.width,
      height: res.height,
      order: localImages.length + index + 1,
    }));
    setPendingDrafts(drafts);
    setStatusMessage('Uploads finished. Review metadata before saving.');
  };

  return (
    <div className="admin-page" onDragOver={(e) => e.preventDefault()} onDrop={onDropFiles}>
      <div className="admin-header">
        <div>
          <h1>Gallery Admin</h1>
          <p>Manage gallery entries, batch upload, and reorder by drag-and-drop.</p>
        </div>
        <div className="status-message" role="status">{statusMessage}</div>
      </div>

      {error && <div className="error">{error}</div>}

      <section className="controls">
        <div className="field">
          <label htmlFor="sectionFilter">Filter by section</label>
          <select
            id="sectionFilter"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            aria-label="Filter images by section"
          >
            <option value="">All sections</option>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search title, description, tags"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="field upload-input">
          <label className="button" htmlFor="fileInput">
            Select files
            <input id="fileInput" type="file" multiple accept="image/*" onChange={onInputFiles} />
          </label>
          <p className="hint">Or drag and drop files anywhere on this page.</p>
        </div>
      </section>

      {pendingDrafts.length > 0 && (
        <section className="card">
          <div className="card-header">
            <h2>Uploaded files - add metadata</h2>
            <button className="button" onClick={saveDrafts} disabled={!pendingDrafts.length}>
              Save all
            </button>
          </div>
          <div className="draft-grid" role="list">
            {pendingDrafts.map((draft, idx) => (
              <div key={`${draft.storagePath}-${idx}`} className="draft" role="listitem">
                <img src={draft.imageUrl} alt={draft.alt} />
                <div className="draft-fields">
                  <label>
                    Section
                    <select
                      value={draft.section}
                      onChange={(e) => handleDraftChange(idx, 'section', e.target.value)}
                    >
                      {sectionOptions.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Title
                    <input
                      type="text"
                      value={draft.title}
                      maxLength={120}
                      onChange={(e) => handleDraftChange(idx, 'title', e.target.value)}
                    />
                  </label>
                  <label>
                    Alt text*
                    <input
                      type="text"
                      value={draft.alt}
                      onChange={(e) => handleDraftChange(idx, 'alt', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={draft.description}
                      onChange={(e) => handleDraftChange(idx, 'description', e.target.value)}
                    />
                  </label>
                  <label>
                    Tags (comma separated)
                    <input
                      type="text"
                      value={draft.tags}
                      onChange={(e) => handleDraftChange(idx, 'tags', e.target.value)}
                    />
                  </label>
                  <label>
                    Location
                    <input
                      type="text"
                      value={draft.location}
                      onChange={(e) => handleDraftChange(idx, 'location', e.target.value)}
                    />
                  </label>
                  <label>
                    Date taken
                    <input
                      type="date"
                      value={draft.dateTaken}
                      onChange={(e) => handleDraftChange(idx, 'dateTaken', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <div className="bulk-actions">
            <button className="button secondary" onClick={selectAll} aria-label="Select all images">
              Select all
            </button>
            <button className="button secondary" onClick={clearSelection} aria-label="Clear selection">
              Clear
            </button>
            <select
              onChange={(e) => handleBulkMove(e.target.value)}
              defaultValue=""
              aria-label="Move selected images to section"
              disabled={!selectedIds.length}
            >
              <option value="">Move to section...</option>
              {sectionOptions.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
            <button
              className="button danger"
              disabled={!selectedIds.length}
              onClick={() => handleDelete(selectedIds)}
              aria-label="Delete selected images"
            >
              Delete selected
            </button>
          </div>
          <div className="upload-status">
            {Object.entries(uploadStatuses).map(([name, status]) => (
              <div key={name} className={`status ${status.status}`}>
                <span>{name}</span>
                <progress max={100} value={status.progress || 0} aria-label={`Upload progress for ${name}`} />
                {status.status === 'error' && <span className="error">{status.error?.message || 'Error'}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="table" role="grid" aria-label="Gallery items table">
          <div className="table-head" role="row">
            <div role="columnheader"></div>
            <div role="columnheader">Preview</div>
            <div role="columnheader">Info</div>
            <div role="columnheader">Tags</div>
            <div role="columnheader">Date</div>
            <div role="columnheader">Actions</div>
          </div>
          {filteredImages.map((img) => (
            <AdminRow
              key={img.id}
              image={img}
              selected={selectedIds.includes(img.id)}
              toggleSelect={toggleSelect}
              onDelete={() => handleSingleDelete(img)}
              onEdit={() => setEditorTarget(img)}
              onReorder={handleReorder}
              isReordering={isReordering}
            />
          ))}
          {!filteredImages.length && <p className="empty">No images found for this filter.</p>}
        </div>
      </section>

      {editorTarget && (
        <EditorModal
          image={editorTarget}
          onClose={() => setEditorTarget(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

const AdminRow = ({ image, selected, toggleSelect, onDelete, onEdit, onReorder, isReordering }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', image.id);
    setDragging(true);
  };

  const handleDrop = (e) => {
    const draggedId = e.dataTransfer.getData('text/plain');
    onReorder(draggedId, image.id);
    setDragging(false);
  };

  return (
    <div
      className={`table-row ${dragging ? 'dragging' : ''}`}
      role="row"
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div role="gridcell">
        <input
          type="checkbox"
          aria-label={`Select image ${image.title}`}
          checked={selected}
          onChange={() => toggleSelect(image.id)}
        />
      </div>
      <div role="gridcell" className="thumbnail">
        <img src={image.imageUrl} alt={image.alt} loading="lazy" />
      </div>
      <div role="gridcell">
        <p className="label">{image.section}</p>
        <h3>{image.title}</h3>
        <p className="muted">{image.description}</p>
      </div>
      <div role="gridcell">{image.tags?.join(', ')}</div>
      <div role="gridcell">{image.dateTaken || image.date}</div>
      <div role="gridcell" className="actions">
        <button className="button secondary" onClick={onEdit} aria-label={`Edit ${image.title}`}>
          Edit
        </button>
        <button className="button danger" onClick={onDelete} aria-label={`Delete ${image.title}`}>
          Delete
        </button>
        {isReordering && <span className="muted">saving...</span>}
      </div>
    </div>
  );
};

const EditorModal = ({ image, onClose, onSave }) => {
  const [form, setForm] = useState({
    id: image.id,
    section: image.section,
    title: image.title || '',
    description: image.description || '',
    tags: image.tags?.join(', ') || '',
    alt: image.alt || '',
    location: image.location || '',
    dateTaken: image.dateTaken || '',
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Edit ${image.title}`}>
      <div className="modal-content">
        <header>
          <h3>Edit image</h3>
          <button className="button secondary" onClick={onClose} aria-label="Close editor">
            Close
          </button>
        </header>
        <div className="modal-body">
          <img src={image.imageUrl} alt={image.alt} className="preview" />
          <div className="form-grid">
            <label>
              Section
              <select value={form.section} onChange={(e) => updateField('section', e.target.value)}>
                {sectionOptions.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input
                type="text"
                value={form.title}
                maxLength={120}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </label>
            <label>
              Alt text*
              <input
                type="text"
                value={form.alt}
                required
                onChange={(e) => updateField('alt', e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} />
            </label>
            <label>
              Tags (comma separated)
              <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} />
            </label>
            <label>
              Location
              <input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
            </label>
            <label>
              Date taken
              <input
                type="date"
                value={form.dateTaken}
                onChange={(e) => updateField('dateTaken', e.target.value)}
              />
            </label>
          </div>
        </div>
        <footer className="modal-footer">
          <button className="button" onClick={() => onSave(form)}>
            Save changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AdminPage;
