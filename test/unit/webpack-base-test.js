
const assert = require('assert');

describe('webpack.base.js test case', () => {
    const baseConfig = require('../../lib/webpack.base.js')

    it('entry', () => {
        assert.equal(baseConfig.entry.index.indexOf('/test/smoke/template/src/index/index.js') > -1);
        assert.equal(baseConfig.entry.search.indexOf('/test/smoke/template/src/search/index.js') > -1);
    });
});