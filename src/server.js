/*
 * some code is copied from https://github.com/shinnn/stylelint-vscode/blob/master/index.js
 */
const {
  createConnection,
  Files,
  TextDocuments
} = require('vscode-languageserver');
const ignore = require('ignore');
const path = require('path');
const _util = require('./util');
const stylelint = require('stylelint');
const arrayToError = require('array-to-error');
const stylelintWarningToVscodeDiagnostic = require('stylelint-warning-to-vscode-diagnostic');
const connection = createConnection(process.stdin, process.stdout);
const documents = new TextDocuments();
const CWD = process.cwd();

function processResults({
  results
}) {
  const [{
    invalidOptionWarnings,
    warnings
  }] = results;

  if (invalidOptionWarnings.length !== 0) {
    const texts = invalidOptionWarnings.map(w => w.text);
    throw arrayToError(texts, SyntaxError);
  }

  if (warnings.length === 0) {
    return [];
  }

  return warnings.map(stylelintWarningToVscodeDiagnostic);
}

async function applyLint(options) {
  let resultContainer;
  try {
    resultContainer = await stylelint.lint(Object.assign({}, options));
  } catch (err) {
    if (
      err.message.startsWith('No configuration provided for') ||
      /No rules found within configuration/.test(err.message)
    ) {
      // Check only CSS syntax errors without applying any stylelint rules
      return processResults(await stylelint.lint(Object.assign({}, options, {
        config: {
          rules: {}
        }
      })));
    }

    throw err;
  }

  return processResults(resultContainer);
}

const ignoreCache = {
  mtime: null,
  ig: null
};

async function validate(document) {
  if (document.languageId !== 'less') return;

  const options = {
    code: document.getText(),
    languageId: 'less',
    syntax: 'less'
  };

  const filePath = Files.uriToFilePath(document.uri);

  if (!filePath.startsWith(CWD)) {
    connection.console.error(`Unexpected error: file is not under process.cwd\n${filePath}\n${CWD}`);
    return;
  }

  try {
    const igFile = path.join(CWD, '.stylelintignore');
    const _st = await _util.stat(igFile);
    if (ignoreCache.mtime !== _st.mtime.toString() || !ignoreCache.ig) {
      ignoreCache.ig = ignore().add(await _util.readFile(igFile, 'utf-8'));
      ignoreCache.mtime = _st.mtime.toString();
    }
    if (ignoreCache.ig.ignores(path.relative(CWD, filePath))) {
      return;
    }
  } catch(ex) {
    // ignore
    connection.console.debug(ex.toString());
  }

  if (filePath) {
    options.codeFilename = filePath;
  }

  try {
    connection.sendDiagnostics({
      uri: document.uri,
      diagnostics: await applyLint(options)
    });
  } catch (err) {
    if (err.reasons) {
      for (const reason of err.reasons) {
        connection.window.showErrorMessage(`stylelint: ${reason}`);
      }

      return;
    }

    // https://github.com/stylelint/stylelint/blob/9.1.1/lib/utils/configurationError.js#L9
    if (err.code === 78) {
      connection.window.showErrorMessage(`stylelint: ${err.message}`);
      return;
    }

    connection.window.showErrorMessage(err.stack.replace(/\n/g, ' '));
  }
}

function validateAll() {
  for (const document of documents.all()) {
    validate(document);
  }
}

connection.onInitialize(() => {
  validateAll();

  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  };
});
connection.onDidChangeWatchedFiles(validateAll);

documents.onDidChangeContent(({
  document
}) => validate(document));
documents.onDidClose(({
  document
}) => connection.sendDiagnostics({
  uri: document.uri,
  diagnostics: []
}));
documents.listen(connection);

connection.listen();