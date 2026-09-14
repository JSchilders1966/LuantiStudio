// ─────────────────────────────────────────────
// LuantiStudio — gedeelde modal/UI helpers
// Geen enkele hier gebruikt window.confirm/alert/prompt: Chrome kan
// native dialogs stilzwijgend onderdrukken na een paar keer, waardoor
// een knop dan niets meer lijkt te doen. Alles hier is een eigen
// in-page modal in de stijl van de rest van de app.
// ─────────────────────────────────────────────

function showConfirmModal(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.75);' +
      'display:flex;align-items:center;justify-content:center;z-index:9999;';

    const box = document.createElement('div');
    box.style.cssText =
      'background:#1e1e2e;border:1px solid #3a3a54;border-radius:12px;' +
      'padding:20px;width:380px;max-width:90vw;display:flex;flex-direction:column;gap:16px;';

    const text = document.createElement('div');
    text.textContent = message;
    text.style.cssText = 'color:#cdd6f4;font-size:.9rem;line-height:1.5;';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = t('common.cancel');
    btnCancel.style.cssText =
      'background:transparent;border:1px solid #3a3a54;color:#7f849c;' +
      'border-radius:6px;padding:6px 14px;cursor:pointer;font-size:.85rem;';

    const btnOk = document.createElement('button');
    btnOk.textContent = t('examples.confirmBtn');
    btnOk.style.cssText =
      'background:#7c6af0;color:#fff;border:none;border-radius:6px;' +
      'padding:6px 16px;cursor:pointer;font-size:.85rem;font-weight:600;';

    const close = result => { document.body.removeChild(overlay); resolve(result); };

    btnCancel.addEventListener('click', () => close(false));
    btnOk.addEventListener('click', () => close(true));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });

    row.append(btnCancel, btnOk);
    box.append(text, row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    btnOk.focus();
  });
}

// Tekstinvoer-modal — vervangt window.prompt().
function showPromptModal(title, defaultValue) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.75);' +
      'display:flex;align-items:center;justify-content:center;z-index:9999;';

    const box = document.createElement('div');
    box.style.cssText =
      'background:#1e1e2e;border:1px solid #3a3a54;border-radius:12px;' +
      'padding:20px;width:380px;max-width:90vw;display:flex;flex-direction:column;gap:14px;';

    const label = document.createElement('div');
    label.textContent = title;
    label.style.cssText = 'color:#cdd6f4;font-size:.9rem;font-weight:600;';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue || '';
    input.style.cssText =
      'background:#2a2a3e;border:1px solid #3a3a54;border-radius:6px;' +
      'color:#cdd6f4;padding:8px 10px;font-size:.9rem;outline:none;';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = t('common.cancel');
    btnCancel.style.cssText =
      'background:transparent;border:1px solid #3a3a54;color:#7f849c;' +
      'border-radius:6px;padding:6px 14px;cursor:pointer;font-size:.85rem;';

    const btnOk = document.createElement('button');
    btnOk.textContent = t('project.saveBtn');
    btnOk.style.cssText =
      'background:#7c6af0;color:#fff;border:none;border-radius:6px;' +
      'padding:6px 16px;cursor:pointer;font-size:.85rem;font-weight:600;';

    const close = result => { document.body.removeChild(overlay); resolve(result); };

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') close(input.value);
      if (e.key === 'Escape') close(null);
    });
    btnCancel.addEventListener('click', () => close(null));
    btnOk.addEventListener('click', () => close(input.value));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });

    row.append(btnCancel, btnOk);
    box.append(label, input, row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.focus();
    input.select();
  });
}

// Kleine toast-melding onderin beeld (bv. "Project opgeslagen").
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(10px);' +
    'background:#2a2a3e;color:#cdd6f4;border:1px solid #3a3a54;border-radius:8px;' +
    'padding:10px 18px;font-size:.85rem;box-shadow:0 8px 24px rgba(0,0,0,.4);' +
    'z-index:9999;opacity:0;transition:opacity .2s, transform .2s;';
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => { if (toast.parentNode) document.body.removeChild(toast); }, 250);
  }, 2200);
}
