(() => {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
  const zeros = (length) => Array(length).fill(0);

  function validate(config) {
    const errors = [];
    if (!config || config.schemaVersion !== 2) errors.push('schemaVersion must be 2');
    const dimensions = config?.dimensions || [];
    if (dimensions.length < 2) errors.push('at least two dimensions are required');
    const ids = new Set();
    const visit = (item, label) => {
      if (!item?.id) errors.push(`${label} is missing id`);
      else if (ids.has(item.id)) errors.push(`duplicate layer/item id: ${item.id}`);
      else ids.add(item.id);
    };
    for (const page of Object.values(config?.pages || {})) for (const item of page.layers || []) visit(item, 'page layer');
    for (const question of config?.questions || []) {
      visit(question, 'question');
      for (const part of question.parts || []) visit(part, 'question part');
      if (question.scene) visit(question.scene, 'question scene');
      for (const option of question.options || []) {
        visit(option, 'option');
        if (!Array.isArray(option.weights) || option.weights.length !== dimensions.length) errors.push(`${option.id} has invalid weights`);
      }
    }
    for (const result of config?.results || []) {
      visit(result, 'result');
      if (!Array.isArray(result.profile) || result.profile.length !== dimensions.length) errors.push(`${result.id} has invalid profile`);
    }
    for (const pageName of ['cover', 'quiz', 'result', 'share']) if (!Number.isFinite(config?.pages?.[pageName]?.canvas?.height)) errors.push(`${pageName} canvas height is required`);
    return errors;
  }

  function score(config, answers) {
    const vector = zeros(config.dimensions.length);
    config.questions.forEach((question, index) => {
      const selected = question.options[answers[index]];
      if (!selected) return;
      selected.weights.forEach((weight, dimension) => { vector[dimension] += weight; });
    });
    const ranking = config.results.map((result) => ({ ...result, score: dot(vector, result.profile) })).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return { vector, ranking, winner: ranking[0], second: ranking[1] };
  }

  function seededSimulation(config, samples = 3000, seed = 20260904) {
    let state = seed >>> 0;
    const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
    const counts = Object.fromEntries(config.results.map(({ id }) => [id, 0]));
    for (let i = 0; i < samples; i += 1) {
      const answers = config.questions.map((question) => Math.floor(random() * question.options.length));
      counts[score(config, answers).winner.id] += 1;
    }
    return counts;
  }

  function allLayers(config, page = 'all') {
    const output = [];
    const add = (value, scope) => value && output.push({ ...value, scope });
    if (page === 'all' || page === 'cover') (config.pages.cover.layers || []).forEach((item) => add(item, 'cover'));
    if (page === 'all' || page === 'quiz') {
      (config.pages.quiz.baseLayers || []).forEach((item) => add(item, 'quiz-base'));
      config.questions.forEach((question) => {
        add(question.scene, `question:${question.id}`);
        question.parts.forEach((item) => add(item, `question:${question.id}`));
        question.options.forEach((option) => add({ ...option, ...option.layout, type: 'option', style: { fontSize: 15, color: config.theme.palette.ink, effect: 'none' } }, `question:${question.id}`));
      });
    }
    if (page === 'all' || page === 'result') (config.pages.result.layers || []).forEach((item) => add(item, 'result'));
    if (page === 'all' || page === 'share') (config.pages.share.layers || []).forEach((item) => add(item, 'share'));
    return output;
  }

  function findLayer(config, id) {
    return allLayers(config).find((item) => item.id === id);
  }

  globalThis.PersonaQuizCore = { clone, validate, score, seededSimulation, allLayers, findLayer };
})();
