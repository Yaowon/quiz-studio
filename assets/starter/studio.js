(() => {
  const core = globalThis.PersonaQuizCore;
  const original = core.clone(globalThis.PERSONA_QUIZ_CONFIG);
  const key = `${original.project.storageKey}:draft`;
  const presets = {
    'editorial-paper': { palette: { paper: '#fff8ec', ink: '#151515', accent: '#d95743', secondary: '#3b72a6', wash: '#f5e7bd' }, typography: { display: 'system-black', body: 'system-sans' }, treatment: { radius: 18, border: 1, shadow: 'soft' } },
    'bright-pop': { palette: { paper: '#fffef5', ink: '#17211d', accent: '#f04b35', secondary: '#1845a5', wash: '#dff3a1' }, typography: { display: 'system-black', body: 'system-sans' }, treatment: { radius: 24, border: 2, shadow: 'hard' } },
    'quiet-film': { palette: { paper: '#f5efe5', ink: '#2e2925', accent: '#935d4a', secondary: '#536d73', wash: '#d7c9aa' }, typography: { display: 'system-serif', body: 'system-serif' }, treatment: { radius: 8, border: 1, shadow: 'soft' } },
    'mono-poster': { palette: { paper: '#f4f4f0', ink: '#111111', accent: '#111111', secondary: '#666666', wash: '#deded9' }, typography: { display: 'system-black', body: 'system-sans' }, treatment: { radius: 0, border: 2, shadow: 'hard' } }
  };
  const paletteLabels = { paper: '底色', ink: '文字', accent: '主强调', secondary: '副强调', wash: '环境色' };
  const els = Object.fromEntries(['studio-page', 'studio-question', 'studio-result', 'canvas-height', 'project-title', 'project-disclaimer', 'question-route', 'result-name', 'result-role', 'result-summary', 'theme-preset', 'palette-controls', 'display-font', 'body-font', 'type-scale', 'theme-radius', 'theme-tracking', 'theme-effect', 'layer-list', 'inspector', 'formal-preview', 'studio-status', 'export-config', 'import-config', 'reset-draft'].map((id) => [id, document.getElementById(id)]));
  const read = () => { try { const draft = JSON.parse(localStorage.getItem(key)); return core.validate(draft).length ? core.clone(original) : draft; } catch { return core.clone(original); } };
  let config = read();
  let selection = { page: 'cover', questionIndex: 0, resultId: config.results[0].id, layerId: null };
  const targetOrigin = location.origin === 'null' ? '*' : location.origin;
  const status = (message) => { els['studio-status'].textContent = message; };
  const persist = (message = '已保存到本机草稿。', sendToPreview = true) => {
    localStorage.setItem(key, JSON.stringify(config));
    if (sendToPreview) postConfig(); status(message);
  };
  const postConfig = () => {
    if (!els['formal-preview'].contentWindow) return;
    els['formal-preview'].contentWindow.postMessage({ type: 'persona-quiz-config', config }, targetOrigin);
    els['formal-preview'].contentWindow.postMessage({ type: 'persona-quiz-view', view: { page: selection.page, questionIndex: selection.questionIndex, forcedResultId: selection.resultId } }, targetOrigin);
  };
  const currentQuestion = () => config.questions[selection.questionIndex];
  const composedOption = (option) => ({ ...option.layout, id: option.id, text: option.text, type: 'option', style: { fontSize: 15, color: config.theme.palette.ink, effect: 'none', ...(option.layout.style || {}) } });
  const selectedLayers = () => {
    if (selection.page === 'cover') return config.pages.cover.layers;
    if (selection.page === 'result' || selection.page === 'share') return config.pages[selection.page].layers;
    return [...config.pages.quiz.baseLayers, currentQuestion().scene, ...currentQuestion().parts, ...currentQuestion().options.map(composedOption)].filter(Boolean);
  };
  const targetFor = (id) => {
    for (const page of ['cover', 'result', 'share']) {
      const item = config.pages[page].layers.find((layer) => layer.id === id);
      if (item) return { source: item, layout: item };
    }
    const base = config.pages.quiz.baseLayers.find((layer) => layer.id === id);
    if (base) return { source: base, layout: base };
    for (const question of config.questions) {
      if (question.scene?.id === id) return { source: question.scene, layout: question.scene };
      const part = question.parts.find((layer) => layer.id === id);
      if (part) return { source: part, layout: part };
      const option = question.options.find((layer) => layer.id === id);
      if (option) return { source: option, layout: option.layout, option: true };
    }
    return null;
  };
  const setValue = (id, property, raw) => {
    const target = targetFor(id); if (!target) return;
    const numeric = ['x', 'y', 'width', 'height', 'scale', 'rotate', 'z', 'fontSize', 'lineHeight', 'letterSpacing'].includes(property);
    const value = numeric ? Number(raw) : raw;
    if (['fontSize', 'lineHeight', 'letterSpacing', 'color', 'effect'].includes(property)) {
      target.layout.style ||= {}; target.layout.style[property] = value;
    } else if (property === 'text' || property === 'src' || property === 'alt') target.source[property] = value;
    else target.layout[property] = value;
    persist();
  };
  const input = (label, property, value, type = 'number', extra = '') => `<label><span class="studio-label">${label}</span><input data-prop="${property}" class="studio-control" type="${type}" value="${String(value ?? '').replace(/"/g, '&quot;')}" ${extra}></label>`;
  const renderInspector = () => {
    const target = selection.layerId && targetFor(selection.layerId);
    if (!target) { els.inspector.innerHTML = '<span class="studio-label">图层属性</span><p>从列表选择一层，或直接点右侧正式页。</p>'; return; }
    const layer = target.option ? composedOption(target.source) : target.layout;
    const style = layer.style || {};
    const contentControls = layer.type === 'image'
      ? `${input('素材 URL', 'src', target.source.src || '', 'url')}${input('替代文本', 'alt', target.source.alt || '', 'text')}`
      : input('文字', 'text', target.source.text || '', 'text');
    els.inspector.innerHTML = `<span class="studio-label">图层属性 · ${layer.id}</span>${contentControls}
      <div class="studio-control--pair">${input('横向 X (%)', 'x', layer.x)}${input('纵向 Y (%)', 'y', layer.y)}</div>
      <div class="studio-control--pair">${input('宽度 (%)', 'width', layer.width)}${input('高度 (%)', 'height', layer.height)}</div>
      <div class="studio-control--pair">${input('缩放', 'scale', layer.scale ?? 1, 'number', 'step=".05"')}${input('旋转', 'rotate', layer.rotate || 0)}</div>
      <div class="studio-control--pair">${input('层级', 'z', layer.z || 2)}${input('字号', 'fontSize', style.fontSize || 15)}</div>
      <div class="studio-control--pair">${input('行高', 'lineHeight', style.lineHeight || 1.35, 'number', 'step=".05"')}${input('字距(em)', 'letterSpacing', style.letterSpacing || 0, 'number', 'step=".01"')}</div>
      ${input('文字颜色', 'color', style.color || config.theme.palette.ink, 'color')}
      <label><span class="studio-label">文字效果</span><select data-prop="effect" class="studio-control"><option value="none">无</option><option value="hard-shadow">硬阴影</option><option value="outline">描边</option><option value="highlight">荧光底</option></select></label>`;
    els.inspector.querySelector('[data-prop="effect"]').value = style.effect || 'none';
    // Commit on change, not every keystroke: re-rendering an inspector while typing loses focus.
    els.inspector.querySelectorAll('[data-prop]').forEach((node) => node.addEventListener('change', () => setValue(layer.id, node.dataset.prop, node.value)));
  };
  const renderLayerList = () => {
    els['layer-list'].replaceChildren();
    selectedLayers().forEach((layer) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = `${layer.type} · ${layer.id}`;
      button.classList.toggle('is-selected', layer.id === selection.layerId);
      button.addEventListener('click', () => selectLayer(layer.id)); els['layer-list'].append(button);
    });
  };
  const selectLayer = (id) => {
    selection.layerId = id; renderLayerList(); renderInspector();
    els['formal-preview'].contentWindow?.postMessage({ type: 'persona-quiz-select-layer', id }, targetOrigin);
  };
  const renderPalette = () => {
    els['palette-controls'].innerHTML = Object.entries(paletteLabels).map(([key, label]) => `<label class="studio-color-row"><span>${label}</span><input data-palette="${key}" type="color" value="${config.theme.palette[key]}"></label>`).join('');
    els['palette-controls'].querySelectorAll('[data-palette]').forEach((node) => node.addEventListener('input', () => { config.theme.palette[node.dataset.palette] = node.value; persist('颜色已更新。'); }));
  };
  const renderSelects = () => {
    els['studio-question'].innerHTML = config.questions.map((item, index) => `<option value="${index}">${item.route || `题目 ${index + 1}`}</option>`).join('');
    els['studio-result'].innerHTML = config.results.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
    els['studio-page'].value = selection.page; els['studio-question'].value = String(selection.questionIndex); els['studio-result'].value = selection.resultId;
    const height = selection.page === 'quiz' ? config.pages.quiz.canvas.height : config.pages[selection.page].canvas.height;
    els['canvas-height'].value = height;
    els['project-title'].value = config.project.title; els['project-disclaimer'].value = config.project.disclaimer;
    els['question-route'].value = currentQuestion().route || ''; const result = config.results.find((item) => item.id === selection.resultId) || config.results[0]; selection.resultId = result.id;
    els['result-name'].value = result.name; els['result-role'].value = result.role; els['result-summary'].value = result.summary;
    els['theme-preset'].value = config.theme.preset; els['display-font'].value = config.theme.typography.display; els['body-font'].value = config.theme.typography.body;
    els['type-scale'].value = config.theme.typography.scale; els['theme-radius'].value = config.theme.treatment.radius; els['theme-tracking'].value = config.theme.typography.tracking || 0; els['theme-effect'].value = config.theme.treatment.shadow;
  };
  const render = () => { renderSelects(); renderPalette(); renderLayerList(); renderInspector(); postConfig(); };
  els['studio-page'].addEventListener('change', () => { selection.page = els['studio-page'].value; selection.layerId = null; render(); });
  els['studio-question'].addEventListener('change', () => { selection.questionIndex = Number(els['studio-question'].value); selection.layerId = null; if (selection.page === 'quiz') render(); else postConfig(); });
  els['studio-result'].addEventListener('change', () => { selection.resultId = els['studio-result'].value; if (selection.page === 'result') render(); else postConfig(); });
  els['canvas-height'].addEventListener('input', () => { const page = selection.page === 'quiz' ? config.pages.quiz : config.pages[selection.page]; page.canvas.height = Number(els['canvas-height'].value); persist('页面长度已更新；图层与选项位置保持独立。'); });
  els['project-title'].addEventListener('change', () => { config.project.title = els['project-title'].value; persist('项目标题已更新。'); });
  els['project-disclaimer'].addEventListener('change', () => { config.project.disclaimer = els['project-disclaimer'].value; persist('免责声明已更新。'); });
  els['question-route'].addEventListener('change', () => { currentQuestion().route = els['question-route'].value; persist('题目路标已更新。'); });
  els['result-name'].addEventListener('change', () => { config.results.find((item) => item.id === selection.resultId).name = els['result-name'].value; persist('结果名称已更新。'); });
  els['result-role'].addEventListener('change', () => { config.results.find((item) => item.id === selection.resultId).role = els['result-role'].value; persist('结果副标题已更新。'); });
  els['result-summary'].addEventListener('change', () => { config.results.find((item) => item.id === selection.resultId).summary = els['result-summary'].value; persist('结果长评已更新。'); });
  els['theme-preset'].addEventListener('change', () => { const preset = presets[els['theme-preset'].value]; config.theme = { ...config.theme, preset: els['theme-preset'].value, palette: { ...preset.palette }, typography: { ...config.theme.typography, ...preset.typography }, treatment: { ...config.theme.treatment, ...preset.treatment } }; persist('已应用预设；所有图层坐标仍保留。'); render(); });
  els['display-font'].addEventListener('change', () => { config.theme.typography.display = els['display-font'].value; persist('展示字体已更新。'); });
  els['body-font'].addEventListener('change', () => { config.theme.typography.body = els['body-font'].value; persist('正文字体已更新。'); });
  els['type-scale'].addEventListener('input', () => { config.theme.typography.scale = Number(els['type-scale'].value); persist('全局字号已更新。'); });
  els['theme-radius'].addEventListener('input', () => { config.theme.treatment.radius = Number(els['theme-radius'].value); persist('圆角已更新。'); });
  els['theme-tracking'].addEventListener('input', () => { config.theme.typography.tracking = Number(els['theme-tracking'].value); persist('全局字距已更新。'); });
  els['theme-effect'].addEventListener('change', () => { config.theme.treatment.shadow = els['theme-effect'].value; persist('效果已更新。'); });
  els['export-config'].addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: 'persona-quiz-config.json' }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 0); status('已导出配置 JSON。');
  });
  els['import-config'].addEventListener('change', async () => {
    const file = els['import-config'].files[0]; if (!file) return;
    try { const candidate = JSON.parse(await file.text()); const errors = core.validate(candidate); if (errors.length) throw new Error(errors.join('；')); config = candidate; persist('已导入并应用配置。'); selection.layerId = null; render(); } catch (error) { status(`导入失败：${error.message}`); }
  });
  els['reset-draft'].addEventListener('click', () => { if (!confirm('恢复模板会删除本机草稿，确定吗？')) return; config = core.clone(original); localStorage.removeItem(key); selection.layerId = null; render(); status('已恢复模板。'); });
  els['formal-preview'].addEventListener('load', postConfig);
  window.addEventListener('message', (event) => {
    if (event.source !== els['formal-preview'].contentWindow || (event.origin !== location.origin && event.origin !== 'null')) return;
    if (event.data?.type === 'persona-quiz-layer-select') selectLayer(event.data.id);
    if (event.data?.type === 'persona-quiz-layer-move') { const target = targetFor(event.data.id); if (!target) return; target.layout.x = event.data.x; target.layout.y = event.data.y; persist('图层位置已保存。', Boolean(event.data.commit)); renderInspector(); renderLayerList(); }
  });
  render();
})();
