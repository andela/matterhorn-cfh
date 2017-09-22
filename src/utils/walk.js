import fs from 'fs';

const walk = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const newPath = `${path}/${file}`;
    const stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(newPath); // eslint-disable-line
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};

export default walk;

