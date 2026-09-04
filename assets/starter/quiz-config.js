(() => {
  const layer = (id, type, x, y, width, text, style = {}) => ({
    id, type, x, y, width, height: 10, scale: 1, rotate: 0, z: 2, text,
    style: { fontSize: 18, lineHeight: 1.35, letterSpacing: 0, color: '#151515', effect: 'none', ...style }
  });

  globalThis.PERSONA_QUIZ_CONFIG = {
    schemaVersion: 2,
    project: {
      title: '示例人格测试',
      storageKey: 'persona-quiz-starter-v1',
      disclaimer: '这是一个娱乐化的角色匹配，不构成任何人格或心理诊断。'
    },
    theme: {
      preset: 'editorial-paper',
      palette: { paper: '#fff8ec', ink: '#151515', accent: '#d95743', secondary: '#3b72a6', wash: '#f5e7bd' },
      typography: { display: 'system-black', body: 'system-sans', scale: 1, tracking: 0 },
      treatment: { radius: 18, border: 1, shadow: 'soft', texture: 'none' }
    },
    pages: {
      cover: {
        canvas: { height: 760 },
        layers: [
          layer('cover-title', 'text', 8, 10, 72, '测一测：\\n你更像哪种团队角色？', { fontSize: 42, lineHeight: 1.08, effect: 'hard-shadow' }),
          layer('cover-note', 'text', 8, 31, 78, '12 个判断 · 约 2 分钟 · 不收集个人信息', { fontSize: 13, color: '#4b4b45' }),
          { ...layer('cover-art', 'vector', 11, 48, 78, '✦', { fontSize: 170, color: '#d95743' }), height: 34, z: 1 },
          layer('cover-footnote', 'text', 8, 88, 66, '你可以改变答案，也可以改变路线。', { fontSize: 13, color: '#4b4b45' }),
          layer('cover-start', 'button', 61, 87, 31, '开始 →', { fontSize: 15, color: '#fff8ec' })
        ]
      },
      quiz: {
        canvas: { height: 760 },
        baseLayers: [
          layer('quiz-route', 'text', 8, 7, 60, '01 / 场景局', { fontSize: 14, color: '#d95743' }),
          layer('quiz-tip', 'text', 8, 92, 84, '没有正确答案，选更像你当下反应的。', { fontSize: 12, color: '#68685f' })
        ],
        optionArea: { x: 8, y: 53, width: 84, gap: 2, itemHeight: 9 }
      },
      result: {
        canvas: { height: 760 },
        layers: [
          layer('result-owner', 'text', 8, 9, 40, '「你的昵称」', { fontSize: 22, color: '#4b4b45' }),
          layer('result-kicker', 'text', 8, 19, 44, '你最像', { fontSize: 18, color: '#d95743' }),
          layer('result-name', 'dynamic', 8, 28, 48, '结果名称', { fontSize: 48, effect: 'hard-shadow' }),
          layer('result-role', 'dynamic', 8, 42, 48, '结果副标题', { fontSize: 20, color: '#d95743' }),
          { ...layer('result-art', 'vector', 55, 14, 37, '✦', { fontSize: 150, color: '#3b72a6' }), height: 45, z: 1 },
          layer('result-copy', 'dynamic', 8, 60, 84, '结果长评', { fontSize: 17, lineHeight: 1.65 }),
          layer('result-share', 'button', 8, 88, 37, '保存结果图', { fontSize: 14, color: '#fff8ec' }),
          layer('result-retry', 'button', 50, 88, 28, '再测一次', { fontSize: 14 })
        ]
      },
      share: {
        canvas: { height: 760 },
        layers: [
          layer('share-project', 'text', 8, 8, 70, '示例人格测试 / 旅行档案', { fontSize: 17, color: '#4b4b45' }),
          layer('share-owner', 'dynamic', 8, 18, 55, '你的昵称', { fontSize: 25, color: '#3b72a6' }),
          layer('share-kicker', 'dynamic', 8, 30, 44, '你最像', { fontSize: 23, color: '#d95743' }),
          layer('share-name', 'dynamic', 8, 39, 58, '结果名称', { fontSize: 48, lineHeight: 1.05, effect: 'hard-shadow' }),
          layer('share-role', 'dynamic', 8, 52, 58, '结果副标题', { fontSize: 21, color: '#d95743' }),
          { ...layer('share-art', 'vector', 63, 18, 28, '✦', { fontSize: 132, color: '#3b72a6' }), height: 34, z: 1 },
          layer('share-copy', 'dynamic', 8, 67, 82, '结果长评', { fontSize: 18, lineHeight: 1.58 }),
          layer('share-note', 'text', 8, 92, 84, '这是娱乐化的角色匹配，不构成心理或人格诊断。', { fontSize: 12, color: '#4b4b45' })
        ]
      }
    },
    dimensions: ['行动直接度', '关系照顾度', '变化偏好'],
    results: [
      { id: 'planner', name: '行动规划者', role: '先把事情落地的人', summary: '你会先把事情拆开、定下下一步，再处理那些还没说清的情绪。', profile: [1, 0, -1] },
      { id: 'connector', name: '关系连接者', role: '先确认大家还好吗的人', summary: '你会先看人有没有被落下，再决定这件事应该怎样继续往前。', profile: [0, 1, 0] },
      { id: 'explorer', name: '即兴探索者', role: '愿意换条路的人', summary: '计划变了不一定是坏事；你更愿意保留流动空间，再看看会发生什么。', profile: [-0.5, 0, 1] }
    ],
    questions: [
      {
        id: 'q1', route: '01 / 决定局', scene: { id: 'q1-scene', type: 'vector', text: '↗', x: 76, y: 12, width: 15, height: 12, scale: 1, rotate: 0, z: 1, style: { fontSize: 56, color: '#3b72a6', effect: 'none' } },
        parts: [
          layer('q1-lead', 'text', 8, 18, 78, '小组到了岔路口，时间不多。', { fontSize: 19, color: '#4b4b45' }),
          layer('q1-choice', 'text', 8, 29, 78, '你更可能先做什么？', { fontSize: 29, color: '#d95743' })
        ],
        options: [
          { id: 'q1-a', text: '列出方案和时间，大家现在就定。', weights: [1, 0, -0.5], layout: { x: 8, y: 53, width: 84, height: 9 } },
          { id: 'q1-b', text: '先问一圈，确认谁最在意什么。', weights: [0, 1, 0.2], layout: { x: 8, y: 64, width: 84, height: 9 } },
          { id: 'q1-c', text: '换一条更有意思的路也没关系。', weights: [-0.5, 0, 1], layout: { x: 8, y: 75, width: 84, height: 9 } }
        ]
      },
      {
        id: 'q2', route: '02 / 意外局', scene: { id: 'q2-scene', type: 'vector', text: '☂', x: 76, y: 12, width: 15, height: 12, scale: 1, rotate: 0, z: 1, style: { fontSize: 52, color: '#d95743', effect: 'none' } },
        parts: [
          layer('q2-lead', 'text', 8, 18, 78, '原计划临时取消，大家都有点烦。', { fontSize: 19, color: '#4b4b45' }),
          layer('q2-choice', 'text', 8, 29, 78, '你的第一反应是？', { fontSize: 29, color: '#d95743' })
        ],
        options: [
          { id: 'q2-a', text: '找一个现在能执行的替代方案。', weights: [1, 0, -0.5], layout: { x: 8, y: 53, width: 84, height: 9 } },
          { id: 'q2-b', text: '先让最失望的人把话说完。', weights: [0, 1, 0.2], layout: { x: 8, y: 64, width: 84, height: 9 } },
          { id: 'q2-c', text: '既然这样，不如临时发明新玩法。', weights: [-0.5, 0, 1], layout: { x: 8, y: 75, width: 84, height: 9 } }
        ]
      },
      {
        id: 'q3', route: '03 / 收尾局', scene: { id: 'q3-scene', type: 'vector', text: '✦', x: 76, y: 12, width: 15, height: 12, scale: 1, rotate: 0, z: 1, style: { fontSize: 54, color: '#d95743', effect: 'none' } },
        parts: [
          layer('q3-lead', 'text', 8, 18, 78, '一整天快结束了，但还有一件事没人处理。', { fontSize: 19, color: '#4b4b45' }),
          layer('q3-choice', 'text', 8, 29, 78, '你会怎么接？', { fontSize: 29, color: '#d95743' })
        ],
        options: [
          { id: 'q3-a', text: '直接接过来，分配完再休息。', weights: [1, 0, -0.5], layout: { x: 8, y: 53, width: 84, height: 9 } },
          { id: 'q3-b', text: '问问有没有人已经很累，不想硬撑。', weights: [0, 1, 0.2], layout: { x: 8, y: 64, width: 84, height: 9 } },
          { id: 'q3-c', text: '换一种做法，未必需要按原来收尾。', weights: [-0.5, 0, 1], layout: { x: 8, y: 75, width: 84, height: 9 } }
        ]
      }
    ],
    scoringTestCases: [
      { name: '行动规划者基准', answers: [0, 0, 0], expected: 'planner' },
      { name: '关系连接者基准', answers: [1, 1, 1], expected: 'connector' },
      { name: '即兴探索者基准', answers: [2, 2, 2], expected: 'explorer' }
    ]
  };
})();
