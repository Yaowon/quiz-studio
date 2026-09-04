(() => {
  const core = globalThis.PersonaQuizCore;
  const params = new URLSearchParams(location.search);
  const studioMode = params.get('studio') === '1';
  const originalConfig = core.clone(globalThis.PERSONA_QUIZ_CONFIG);
  const draftKey = `${originalConfig.project.storageKey}:draft`;
  const safeReadDraft = () => {
    try { const draft = JSON.parse(localStorage.getItem(draftKey)); return core.validate(draft).length ? originalConfig : draft; } catch { return originalConfig; }
  };
  let config = safeReadDraft();
  let state = { page: 'cover', questionIndex: 0, answers: [], name: sessionStorage.getItem(`${draftKey}:name`) || '', forcedResultId: null };

  const app = document.querySelector('#app');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const fontMap = {
    'system-black': 'system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
    'system-serif': 'ui-serif, "Songti SC", "STSong", serif',
    'system-rounded': 'ui-rounded, "PingFang SC", "Microsoft YaHei", sans-serif',
    'system-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
  };
  const dynamicText = (id, fallback = '') => {
    const result = currentResult();
    if (id === 'result-owner' || id === 'share-owner') return state.name ? `「${state.name}」` : '「你的昵称」';
    if (id === 'result-kicker' || id === 'share-kicker') return '你最像';
    if (id === 'result-name' || id === 'share-name') return result?.name || fallback;
    if (id === 'result-role' || id === 'share-role') return result?.role || fallback;
    if (id === 'result-copy' || id === 'share-copy') return result?.summary || fallback;
    return fallback;
  };
  const currentResult = () => {
    if (state.forcedResultId) return config.results.find((item) => item.id === state.forcedResultId) || config.results[0];
    return state.answers.length ? core.score(config, state.answers).winner : config.results[0];
  };
  const themeVariables = () => {
    const { palette, typography, treatment } = config.theme;
    return `--paper:${palette.paper};--ink:${palette.ink};--accent:${palette.accent};--secondary:${palette.secondary};--wash:${palette.wash};--display-font:${fontMap[typography.display] || typography.display};--body-font:${fontMap[typography.body] || typography.body};--type-scale:${typography.scale || 1};--global-tracking:${typography.tracking || 0}em;--radius:${treatment.radius || 0}px;--border:${treatment.border || 0}px;--shadow:${treatment.shadow === 'none' ? 'none' : treatment.shadow === 'hard' ? '6px 6px 0 rgba(21,21,21,.85)' : '0 14px 35px rgba(32,25,13,.12)'}`;
  };
  const pageData = () => config.pages[state.page];
  const percent = (value) => `${Number(value || 0)}%`;
  const layerStyle = (layer) => {
    const style = layer.style || {};
    return `left:${percent(layer.x)};top:${percent(layer.y)};width:${percent(layer.width || 0)};height:${layer.height ? percent(layer.height) : 'auto'};--font-size:${style.fontSize || 16}px;--line-height:${style.lineHeight || 1.35};--tracking:${style.letterSpacing || 0}em;--color:${style.color || config.theme.palette.ink};--z:${layer.z || 2};transform:scale(${layer.scale ?? 1}) rotate(${layer.rotate || 0}deg)`;
  };
  const labelClass = (layer) => `layer layer--${layer.type}${layer.type === 'text' || layer.type === 'dynamic' ? ' layer--display' : ''}${layer.style?.effect && layer.style.effect !== 'none' ? ` effect-${layer.style.effect}` : ''}`;
  const makeLayer = (layer, textOverride) => {
    const text = textOverride ?? (layer.type === 'dynamic' ? dynamicText(layer.id, layer.text) : layer.text || '');
    const node = document.createElement(layer.type === 'button' ? 'button' : layer.type === 'image' ? 'img' : 'div');
    node.className = labelClass(layer);
    node.dataset.layerId = layer.id;
    node.style.cssText = layerStyle(layer);
    if (layer.type === 'image') { node.src = layer.src || ''; node.alt = layer.alt || ''; }
    else node.textContent = text;
    if (layer.type === 'button') node.type = 'button';
    if (layer.type === 'button' && layer.id === 'cover-start') node.addEventListener('click', openNameGate);
    if (layer.type === 'button' && layer.id === 'result-share') node.addEventListener('click', exportResultImage);
    if (layer.type === 'button' && layer.id === 'result-retry') node.addEventListener('click', () => { state = { ...state, page: 'cover', questionIndex: 0, answers: [], forcedResultId: null }; render(); });
    attachStudioPointer(node, layer.id);
    return node;
  };
  const getLayerTarget = (id) => {
    for (const page of ['cover', 'result', 'share']) {
      const target = config.pages[page].layers.find((item) => item.id === id);
      if (target) return { layer: target, holder: target };
    }
    const base = config.pages.quiz.baseLayers.find((item) => item.id === id);
    if (base) return { layer: base, holder: base };
    for (const question of config.questions) {
      if (question.scene?.id === id) return { layer: question.scene, holder: question.scene };
      const part = question.parts.find((item) => item.id === id);
      if (part) return { layer: part, holder: part };
      const option = question.options.find((item) => item.id === id);
      if (option) return { layer: { ...option.layout, id: option.id, type: 'option', text: option.text, style: { fontSize: 15, color: config.theme.palette.ink, effect: 'none', ...(option.layout.style || {}) } }, holder: option.layout, option };
    }
    return null;
  };
  const studioTargetOrigin = location.origin === 'null' ? '*' : location.origin;
  const sendStudio = (type, payload) => parent !== window && parent.postMessage({ type, ...payload }, studioTargetOrigin);
  const attachStudioPointer = (node, id) => {
    if (!studioMode) return;
    node.addEventListener('pointerdown', (event) => {
      const target = getLayerTarget(id);
      if (!target) return;
      event.preventDefault();
      node.setPointerCapture?.(event.pointerId);
      const stage = node.closest('.stage');
      const rect = stage.getBoundingClientRect();
      const start = { x: event.clientX, y: event.clientY, layerX: Number(target.holder.x || 0), layerY: Number(target.holder.y || 0) };
      node.classList.add('is-selected');
      sendStudio('persona-quiz-layer-select', { id });
      const move = (moveEvent) => {
        target.holder.x = Number(clamp(start.layerX + ((moveEvent.clientX - start.x) / rect.width) * 100, -100, 200).toFixed(2));
        target.holder.y = Number(clamp(start.layerY + ((moveEvent.clientY - start.y) / rect.height) * 100, -100, 200).toFixed(2));
        node.style.left = percent(target.holder.x);
        node.style.top = percent(target.holder.y);
        sendStudio('persona-quiz-layer-move', { id, x: target.holder.x, y: target.holder.y, commit: false });
      };
      const end = () => {
        sendStudio('persona-quiz-layer-move', { id, x: target.holder.x, y: target.holder.y, commit: true });
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', end);
        node.removeEventListener('pointercancel', end);
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', end);
      node.addEventListener('pointercancel', end);
    });
  };
  const createStage = () => {
    const page = pageData();
    const stage = document.createElement('section');
    stage.className = `stage stage--${state.page}`;
    stage.style.cssText = `${themeVariables()};height:${page.canvas.height}px`;
    return stage;
  };
  const renderHeader = () => {
    const header = document.createElement('header');
    header.className = 'site-header';
    const title = document.createElement('span');
    title.className = 'site-header__title';
    title.textContent = config.project.title;
    header.append(title);
    if (config.media?.audio?.src) {
      const audio = document.createElement('audio');
      audio.src = config.media.audio.src;
      audio.loop = config.media.audio.loop !== false;
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'music-toggle'; toggle.textContent = '播放音乐';
      toggle.addEventListener('click', async () => {
        if (audio.paused) { await audio.play(); toggle.textContent = '暂停音乐'; } else { audio.pause(); toggle.textContent = '播放音乐'; }
      });
      header.append(audio, toggle);
    }
    return header;
  };
  const renderCover = () => {
    const stage = createStage();
    config.pages.cover.layers.forEach((layer) => stage.append(makeLayer(layer)));
    return stage;
  };
  const renderQuiz = () => {
    const stage = createStage();
    const question = config.questions[state.questionIndex];
    config.pages.quiz.baseLayers.forEach((layer) => stage.append(makeLayer(layer, layer.id === 'quiz-route' ? question.route : undefined)));
    if (question.scene) stage.append(makeLayer(question.scene));
    question.parts.forEach((part) => stage.append(makeLayer(part)));
    question.options.forEach((option, index) => {
      const node = document.createElement('button');
      const layer = { ...option.layout, id: option.id, type: 'option', style: { fontSize: 15, color: config.theme.palette.ink, effect: 'none', ...(option.layout.style || {}) } };
      node.className = `option${layer.style.effect && layer.style.effect !== 'none' ? ` effect-${layer.style.effect}` : ''}`; node.type = 'button'; node.dataset.layerId = option.id; node.style.cssText = layerStyle(layer);
      node.innerHTML = `<span class="option__index">${index + 1}</span><span>${escapeHtml(option.text)}</span>`;
      if (!studioMode) node.addEventListener('click', () => chooseOption(index));
      attachStudioPointer(node, option.id);
      stage.append(node);
    });
    return stage;
  };
  const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  const renderResult = () => {
    const stage = createStage();
    config.pages.result.layers.forEach((layer) => stage.append(makeLayer(layer)));
    return stage;
  };
  const renderShare = () => {
    const stage = createStage();
    config.pages.share.layers.forEach((layer) => stage.append(makeLayer(layer)));
    return stage;
  };
  const chooseOption = (optionIndex) => {
    state.answers[state.questionIndex] = optionIndex;
    if (state.questionIndex + 1 < config.questions.length) state.questionIndex += 1;
    else state.page = 'result';
    render();
  };
  const renderNav = () => {
    if (state.page !== 'quiz' || studioMode) return null;
    const nav = document.createElement('nav'); nav.className = 'quiz-nav';
    const back = document.createElement('button'); back.type = 'button'; back.className = 'quiet-button';
    back.textContent = state.questionIndex ? '← 返回上一题' : '← 返回封面';
    back.addEventListener('click', () => {
      if (state.questionIndex) { state.questionIndex -= 1; state.answers.pop(); } else state.page = 'cover';
      render();
    });
    const progress = document.createElement('span'); progress.textContent = `${state.questionIndex + 1} / ${config.questions.length}`; progress.style.alignSelf = 'center';
    nav.append(back, progress); return nav;
  };
  const render = () => {
    document.body.classList.toggle('is-studio', studioMode);
    document.title = config.project.title;
    app.replaceChildren();
    const shell = document.createElement('div'); shell.className = 'app-shell'; shell.append(renderHeader());
    shell.append(state.page === 'cover' ? renderCover() : state.page === 'quiz' ? renderQuiz() : state.page === 'share' ? renderShare() : renderResult());
    const nav = renderNav(); if (nav) shell.append(nav);
    app.append(shell);
  };
  const openNameGate = () => {
    const dialog = document.createElement('dialog'); dialog.className = 'export-dialog';
    dialog.innerHTML = `<form method="dialog" class="export-dialog__panel"><h2>怎么称呼你？</h2><p>可选。这个称呼只用于你的结果图，不会上传。</p><input autofocus name="name" maxlength="24" placeholder="例如：小花" class="studio-control"><div class="export-dialog__actions"><button class="quiet-button" value="skip">不填</button><button class="layer--button" value="confirm">确认</button></div></form>`;
    document.body.append(dialog);
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'confirm') {
        state.name = dialog.querySelector('[name="name"]').value.trim();
        sessionStorage.setItem(`${draftKey}:name`, state.name);
      }
      dialog.remove(); state.page = 'quiz'; state.questionIndex = 0; state.answers = []; render();
    });
    dialog.showModal?.();
  };
  const drawWrapped = (ctx, text, x, y, width, lineHeight, maxLines = 99) => {
    let line = ''; let cursor = y; let count = 0;
    for (const character of String(text)) {
      const candidate = line + character;
      if (ctx.measureText(candidate).width > width && line) { ctx.fillText(line, x, cursor); line = character; cursor += lineHeight; count += 1; if (count >= maxLines) return cursor; }
      else line = candidate;
    }
    if (line && count < maxLines) ctx.fillText(line, x, cursor);
    return cursor + lineHeight;
  };
  const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error(`无法读取图片：${src}`));
    if (/^https?:/i.test(src)) image.crossOrigin = 'anonymous'; image.src = src;
  });
  const showExportError = (message) => {
    const dialog = document.querySelector('#export-dialog');
    dialog.innerHTML = `<div class="export-dialog__panel"><h2>结果图未生成</h2><p>${escapeHtml(message)}</p><button class="quiet-button" type="button">关闭</button></div>`;
    dialog.querySelector('button').addEventListener('click', () => dialog.close()); dialog.showModal?.();
  };
  const exportResultImage = async () => {
    const result = currentResult(); const { palette } = config.theme; const share = config.pages.share;
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1440;
    const ctx = canvas.getContext('2d'); const scale = canvas.width / 540;
    ctx.fillStyle = palette.paper; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = palette.accent; ctx.fillRect(0, 0, canvas.width, 28);
    try {
      const layers = [...share.layers].sort((a, b) => (a.z || 2) - (b.z || 2));
      for (const layer of layers) {
        const style = layer.style || {}; const x = (layer.x / 100) * canvas.width; const y = (layer.y / 100) * canvas.height;
        const width = (layer.width / 100) * canvas.width; const height = ((layer.height || 12) / 100) * canvas.height;
        const fontSize = (style.fontSize || 16) * scale; const font = fontMap[config.theme.typography.display] || config.theme.typography.display;
        ctx.save(); ctx.translate(x, y); ctx.scale(layer.scale || 1, layer.scale || 1); ctx.rotate((layer.rotate || 0) * Math.PI / 180);
        if (layer.type === 'image' && layer.src) { const image = await loadImage(layer.src); ctx.drawImage(image, 0, 0, width, height); ctx.restore(); continue; }
        ctx.fillStyle = style.color || palette.ink; ctx.font = `${layer.type === 'dynamic' || layer.type === 'text' ? '700' : '500'} ${fontSize}px ${font}`;
        if (layer.type === 'vector') ctx.fillText(layer.text || '', 0, fontSize);
        else drawWrapped(ctx, layer.type === 'dynamic' ? dynamicText(layer.id, layer.text) : layer.text || '', 0, fontSize, width, fontSize * (style.lineHeight || 1.35), Math.max(1, Math.floor(height / (fontSize * (style.lineHeight || 1.35)))));
        ctx.restore();
      }
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('浏览器无法把画布转换成 PNG。请确认素材与网页同源，或使用可公开跨域读取的素材。');
      const url = URL.createObjectURL(blob); const dialog = document.querySelector('#export-dialog');
      dialog.innerHTML = `<div class="export-dialog__panel"><h2>结果图已生成</h2><img src="${url}" alt="你的结果图预览"><div class="export-dialog__actions"><a class="layer--button" href="${url}" download="${result.name}-结果图.png">下载 PNG</a><button class="quiet-button" type="button">关闭</button></div></div>`;
      dialog.querySelector('button').addEventListener('click', () => dialog.close()); dialog.addEventListener('close', () => URL.revokeObjectURL(url), { once: true }); dialog.showModal?.();
    } catch (error) { showExportError(`${error.message} 请把最终素材放在项目的 assets/ 目录并以相对路径引用。`); }
  };
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || !event.data) return;
    if (event.data.type === 'persona-quiz-config') { config = core.clone(event.data.config); render(); }
    if (event.data.type === 'persona-quiz-view') { state = { ...state, ...event.data.view }; render(); }
    if (event.data.type === 'persona-quiz-select-layer') document.querySelector(`[data-layer-id="${CSS.escape(event.data.id)}"]`)?.classList.add('is-selected');
  });
  render();
})();
