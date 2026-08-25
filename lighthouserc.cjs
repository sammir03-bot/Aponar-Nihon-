module.exports = {
  ci: {
    collect: {
      staticDistDir: './_site',
      url: ['http://localhost/index.html'],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
