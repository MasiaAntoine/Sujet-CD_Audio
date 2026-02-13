module.exports = require('babel-jest').default.createTransformer({
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    [
      'babel-plugin-transform-vite-meta-env',
      {
        env: {
          VITE_API_URL: 'http://localhost:5005/api/cds'
        }
      }
    ]
  ]
});
