/* global suite, test */

const {
  extensions,
  workspace,
  window
} = require('vscode');
const assert = require('assert');

suite('vscode-lesslint', function () {
  const vscodeLesslint = extensions.getExtension('yuhang.vscode-lesslint');    
  assert.equal(!!vscodeLesslint, true, 'Lesslint extensition is not installed');

  test('should not be activated when the open file is not less.', async function () {
    const plaintextDocument = await workspace.openTextDocument({
      content: 'Hello',
      language: 'plaintext'
    });
    await window.showTextDocument(plaintextDocument);
    assert.equal(vscodeLesslint.isActive, false);
  });
  test('should be activated when the open file is less.', async function() {
    const lessDocument = await workspace.openTextDocument({
      content: 'padding: 0;',
      language: 'less'
    });
    await window.showTextDocument(lessDocument);
    assert.equal(vscodeLesslint.isActive, true);
  });
});