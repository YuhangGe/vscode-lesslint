const {
  LanguageClient
} = require('vscode-languageclient');
const path = require('path');
const {
  workspace
} = require('vscode');
const {
  activationEvents
} = require('../package.json');

const documentSelector = [];

for (const activationEvent of activationEvents) {
  if (activationEvent.startsWith('onLanguage:')) {
    const language = activationEvent.replace('onLanguage:', '');
    documentSelector.push({
      language,
      scheme: 'file'
    }, {
      language,
      scheme: 'untitled'
    });
  }
}

exports.activate = function() {
  const serverPath = path.join(__dirname, 'server.js');

  const client = new LanguageClient('lesslint', {
    run: {
      module: serverPath
    },
    debug: {
      module: serverPath,
      options: {
        execArgv: ['--nolazy', '--debug=6004']
      }
    }
  }, {
    documentSelector,
    synchronize: {
      configurationSection: 'lesslint',
      fileEvents: workspace.createFileSystemWatcher('**/{.stylelintrc{,.js,.json,.yaml,.yml},.stylelintignore}')
    }
  });

  client.start();
};