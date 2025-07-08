// File handling utilities
export const getFileIcon = (fileType) => {
  const iconMap = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'ppt': '📈',
    'pptx': '📈',
    'txt': '📄',
    'csv': '📊',
    'json': '📋',
    'js': '⚡',
    'jsx': '⚡',
    'ts': '🔷',
    'tsx': '🔷',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'h': '⚙️',
    'cs': '💎',
    'php': '🐘',
    'rb': '💎',
    'go': '🔹',
    'rs': '🦀',
    'swift': '🍎',
    'kt': '🎯',
    'scala': '🎨',
    'sql': '🗃️',
    'sh': '🐚',
    'bash': '🐚',
    'yml': '📝',
    'yaml': '📝',
    'toml': '📝',
    'ini': '📝',
    'env': '🔧',
    'md': '📝',
    'html': '🌐',
    'css': '🎨',
    'xml': '📄',
    'svg': '🎨',
    'default': '📄'
  };
  
  return iconMap[fileType] || iconMap.default;
};

export const SUPPORTED_FILE_TYPES = [
  'image/*',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.json', '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb',
  '.go', '.rs', '.swift', '.kt', '.scala', '.sql', '.sh',
  '.bash', '.yml', '.yaml', '.toml', '.ini', '.env', '.md',
  '.html', '.css', '.xml', '.svg'
];

export const TEXT_FILE_EXTENSIONS = [
  '.txt', '.md', '.json', '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb',
  '.go', '.rs', '.swift', '.kt', '.scala', '.sql', '.sh',
  '.bash', '.yml', '.yaml', '.toml', '.ini', '.env',
  '.html', '.css', '.xml', '.svg'
];

export const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    
    // Read different file types appropriately
    if (file.type.startsWith('text/') || 
        TEXT_FILE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
};
