const { execSync } = require('child_process');

// Get previous tag from command line argument
const previousTag = process.argv[2];

// Get commits since previous tag
let commits;
try {
  if (!previousTag || previousTag === '') {
    // No previous tag, get all commits
    commits = execSync('git log --pretty=format:"%s|||%h"', { encoding: 'utf8' });
  } else {
    commits = execSync(`git log ${previousTag}..HEAD --pretty=format:"%s|||%h"`, { encoding: 'utf8' });
  }
} catch (error) {
  console.error('Error getting git log:', error.message);
  process.exit(1);
}

if (!commits || commits.trim() === '') {
  console.log('No changes since last release.');
  process.exit(0);
}

// Parse commits into categories
const categories = {
  features: [],
  fixes: [],
  enhancements: [],
  documentation: [],
  other: []
};

const commitLines = commits.split('\n').filter(line => line.trim() !== '');

commitLines.forEach(line => {
  const [message, hash] = line.split('|||');
  const lowerMessage = message.toLowerCase();

  // Skip release commits
  if (lowerMessage.includes('release:') || lowerMessage.includes('prepare v')) {
    return;
  }

  const commitLink = `[${hash}](https://github.com/${process.env.GITHUB_REPOSITORY || 'owner/repo'}/commit/${hash})`;
  const formattedMessage = `- ${message} (${commitLink})`;

  // Categorize commits
  if (lowerMessage.match(/^(feat|feature|add)[\s:]/)) {
    categories.features.push(formattedMessage);
  } else if (lowerMessage.match(/^(fix|bugfix)[\s:]/)) {
    categories.fixes.push(formattedMessage);
  } else if (lowerMessage.match(/^(enhance|enhancement|update|improve|refactor)[\s:]/)) {
    categories.enhancements.push(formattedMessage);
  } else if (lowerMessage.match(/^(docs|documentation)[\s:]/)) {
    categories.documentation.push(formattedMessage);
  } else {
    categories.other.push(formattedMessage);
  }
});

// Build changelog markdown
let changelog = '';

if (categories.features.length > 0) {
  changelog += '### Features\n\n';
  changelog += categories.features.join('\n') + '\n\n';
}

if (categories.fixes.length > 0) {
  changelog += '### Bug Fixes\n\n';
  changelog += categories.fixes.join('\n') + '\n\n';
}

if (categories.enhancements.length > 0) {
  changelog += '### Enhancements\n\n';
  changelog += categories.enhancements.join('\n') + '\n\n';
}

if (categories.documentation.length > 0) {
  changelog += '### Documentation\n\n';
  changelog += categories.documentation.join('\n') + '\n\n';
}

if (categories.other.length > 0) {
  changelog += '### Other Changes\n\n';
  changelog += categories.other.join('\n') + '\n\n';
}

if (changelog === '') {
  changelog = 'No notable changes in this release.\n';
}

console.log(changelog.trim());
